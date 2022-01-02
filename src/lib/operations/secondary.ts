import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import { formatChannelName } from "../formatString.js";
import { getChannel } from "../getCached.js";
import { logger } from "../logger.js";
import { updateActivityCount } from "../operations/general.js";
import { db } from "../prisma.js";
import { bree } from "../scheduler.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deletes Secondary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 */
export const deleteDiscordSecondary = async (
  channel: BaseGuildVoiceChannel
) => {
  const { id } = channel;
  const channelConfig = await db.secondary.findUnique({
    where: { id },
  });
  if (channel?.members.size !== 0 || !channel?.deletable || !channelConfig)
    return;

  const textChannel = async () => {
    if (channelConfig.textChannelId) {
      const discordTextChannel = await channel.guild.channels.fetch(
        channelConfig.textChannelId
      );
      if (discordTextChannel?.deletable || discordTextChannel?.isText()) {
        return await discordTextChannel;
      }
    }
    return undefined;
  };
  await Promise.all([
    db.secondary.delete({ where: { id } }),
    channel?.delete(),
    (await textChannel())?.delete(),
  ]);
  bree.remove(id);
  await updateActivityCount(channel.client);
  await logger.debug(`Secondary channel deleted ${id}.`);
};

/**
 * Creates a secondary channel linked to a primary.
 * @param channelManager Discord's Channel Manager.
 * @param primaryId ID of the primary channel to link to.
 * @param member The user (if they're specified) to be moved to the new channel.
 */
export const createSecondary = async (
  channelManager: GuildChannelManager,
  primaryId: string,
  member?: GuildMember
) => {
  const primaryConfig = await db.primary.findUnique({
    where: { id: primaryId },
    include: { guild: true, secondaries: true },
  });

  if (!primaryConfig) return;

  const aliases = await db.alias.findMany({
    where: { guildId: channelManager.guild.id },
  });

  const primaryChannel = await getChannel(channelManager, primaryId);

  if (!primaryConfig || !primaryChannel?.isVoice()) return;

  const activities = Array.from(primaryChannel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });

  const filteredActivityList = activities
    .filter((activity) => activity !== "Spotify")
    .filter((activity) => activity !== "Custom Status");

  const str = !filteredActivityList.length
    ? primaryConfig.generalName
    : primaryConfig.template;

  const secondary = await channelManager.create(
    formatChannelName(str, {
      creator: member?.displayName as string,
      channelNumber: primaryConfig.secondaries.length + 1,
      activities: filteredActivityList,
      aliases,
      memberCount: primaryChannel.members.size,
      locked: false,
    }),
    {
      type: "GUILD_VOICE",
      parent: primaryChannel?.parent ?? undefined,
      position: primaryChannel?.position
        ? primaryChannel.position + 1
        : undefined,
    }
  );

  if (secondary.parent) {
    secondary.lockPermissions();
  }

  if (member) {
    member.voice.setChannel(secondary);
  }
  const textChannelId = async () => {
    if (primaryConfig.guild?.textChannelsEnabled && member) {
      const textChannel = await channelManager.create("Text Channel", {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          { id: channelManager.guild.roles.everyone, deny: "VIEW_CHANNEL" },
          { id: member?.id, allow: "VIEW_CHANNEL" },
        ],
        parent: secondary.parent ?? undefined,
      });
      return textChannel.id;
    }
  };

  await db.secondary.create({
    data: {
      id: secondary.id,
      creator: member?.id,
      primaryId,
      guildId: channelManager.guild.id,
      textChannelId: await textChannelId(),
    },
  });

  bree.add({
    name: secondary.id,
    timeout: false,
    worker: {
      workerData: {
        channel: await secondary,
        token: process.env.TOKEN,
      },
    },
    path: path.join(__dirname, "../../jobs", "refreshSecondary.js"),
  });

  await updateActivityCount(channelManager.client);
  await logger.debug(
    `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${channelManager.guild.name}.`
  );
};

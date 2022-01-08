import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import { registerNewJob } from "../../jobs";
import { bree } from "../bree";
import { db } from "../db";
import { formatChannelName } from "../formatString";
import { getChannel } from "../getCached";
import { logger } from "../logger";
import { updateActivityCount } from "./general";

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

  try {
    await db.secondary.delete({ where: { id } });
  } catch (e) {
    logger.error("Secondary db entry does not exist:", e);
  }
  try {
    await channel?.delete();
  } catch (e) {
    logger.error("Secondary discord channel does not exist:", e);
  }

  try {
    await (await textChannel())?.delete();
  } catch (e) {
    logger.error("Secondary text channel does not exist:", e);
  }
  try {
    await bree.remove(id);
  } catch (e) {
    logger.error("Bree job doesn't exist:", e);
  }

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
      permissionOverwrites: primaryChannel.permissionOverwrites.cache,
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

  const secondaryDb = await db.secondary.create({
    data: {
      id: secondary.id,
      creator: member?.id,
      primaryId,
      guildId: channelManager.guild.id,
      textChannelId: await textChannelId(),
    },
  });
  await registerNewJob(secondaryDb);

  await updateActivityCount(channelManager.client);
  await logger.debug(
    `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${channelManager.guild.name}.`
  );
};

import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import checkGuild from "../checks/guild";
import { debug } from "../colourfulLogger";
import { formatString } from "../formatString";
import { getChannel } from "../getCached";
import { prisma } from "../prisma";
import { scheduler } from "../scheduler";
import { updateActivityCount } from "./general";

/**
 * Deletes Secondary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deleteSecondary = async (channel: BaseGuildVoiceChannel) => {
  const { id } = channel;
  const channelConfig = await prisma.secondary.findUnique({
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
    prisma.secondary.delete({ where: { id } }),
    channel?.delete(),
    (await textChannel())?.delete(),
  ]);
  scheduler.removeById(id);
  await updateActivityCount(channel.client);
  await debug(`Secondary channel deleted ${id}.`);
};

/**
 * Deleted Secondary Channel.
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletedSecondary = async (channelId: string) => {
  const channel = await prisma.secondary.findUnique({
    where: { id: channelId },
  });
  if (!channel) return;
  await prisma.secondary.delete({ where: { id: channelId } });
  await debug(`Secondary channel deleted ${channelId}`);
};

/**
 * Creates a secondary channel linked to a primary.
 * @param channelManager Discord's Channel Manager.
 * @param primaryId ID of the primary channel to link to.
 * @param member The user (if they're specified) to be moved to the new channel.
 * @returns
 */
export const createSecondary = async (
  channelManager: GuildChannelManager,
  primaryId: string,
  member?: GuildMember
) => {
  const primaryConfig = await prisma.primary.findUnique({
    where: { id: primaryId },
    include: { guild: true, secondaries: true },
  });

  if (!primaryConfig) return;

  const aliases = await prisma.alias.findMany({
    where: { guildId: channelManager.guild.id },
  });

  const primaryChannel = await getChannel(channelManager, primaryId);

  if (!primaryConfig || !primaryChannel?.isVoice()) return;

  const activities = Array.from(primaryChannel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });

  const str = !activities.length
    ? primaryConfig.generalName
    : primaryConfig.template;

  const secondary = await channelManager.create(
    formatString(str, {
      creator: member?.displayName as string,
      channelNumber: primaryConfig.secondaries.length + 1,
      activities: activities,
      aliases,
      memberCount: primaryChannel.members.size,
    }),
    {
      type: "GUILD_VOICE",
      parent: primaryChannel?.parent ?? undefined,
      position: primaryChannel?.position
        ? primaryChannel.position + 1
        : undefined,
    }
  );

  // secondary.setPosition(primaryChannel?.position + 1);
  if (secondary.parent) {
    secondary.lockPermissions();
  }

  if (member) {
    member.voice.setChannel(secondary);
  }
  await checkGuild(channelManager.guild.id);
  const textChannelId = async () => {
    if (primaryConfig.guild?.textChannelsEnabled && member) {
      const textChannel = await channelManager.create("Text Channel", {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          { id: channelManager.guild.roles.everyone, deny: "VIEW_CHANNEL" },
          { id: member?.id, allow: "VIEW_CHANNEL" },
        ],
        parent: secondary.parent ?? undefined
      });
      return textChannel.id;
    }
  };

  await prisma.secondary.create({
    data: {
      id: secondary.id,
      creator: member?.id,
      primaryId,
      guildId: channelManager.guild.id,
      textChannelId: await textChannelId(),
    },
  });

  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 5 },
      new Task(secondary.id, () => refreshSecondary(secondary))
    )
  );

  await updateActivityCount(channelManager.client);
  await debug(
    `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${channelManager.guild.name}.`
  );
};

/**
 * Retrieves data from db and changes channel name with formatting.
 * @param id Secondary channel id.
 * @param channelManager Discord Channel Manager
 * @returns nothing.
 */
export const refreshSecondary = async (channel: BaseGuildVoiceChannel) => {
  const { id } = channel;
  const secondary = await prisma.secondary.findUnique({
    where: { id },
    include: {
      primary: true,
      guild: true,
    },
  });
  const aliases = await prisma.alias.findMany({
    where: {
      guildId: channel.id,
    },
  });
  if (!secondary) return;

  const channelCreator = secondary.creator
    ? channel.members.get(secondary.creator)?.displayName
    : "";
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;
  if (!channel?.manageable) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const str = secondary.name
    ? secondary.name
    : !activities.length
    ? secondary.primary.generalName
    : secondary.primary.template;
  const name = formatString(str, {
    creator: creator ? creator : "",
    aliases: aliases,
    channelNumber: 1,
    activities,
    memberCount: channel.members.size,
  });
  if (channel.name === name) {
    debug(`Skipped rename for ${channel.name} as name hasn't changed.`);
  } else {
    await channel.edit({
      name,
    });
    debug(
      `Secondary channel ${channel.name} in ${channel.guild.name} refreshed.`
    );
  }
};

import {
  BaseGuildVoiceChannel,
  Client,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import { formatString } from "./formatString";
import { prisma } from "./prisma";
import { warn, log, info, error, debug } from "../lib/colourfulLogger";
import { scheduler } from "./scheduler";
import { SimpleIntervalJob, Task } from "toad-scheduler";

/**
 * Create Primary Channel
 * @param channelManager
 * @param userId
 * @returns Promise
 */
export const createPrimary = async (
  channelManager: GuildChannelManager,
  userId: string
) => {
  const channel = await channelManager.create("➕ New Session", {
    type: "GUILD_VOICE",
  });

  const primary = await prisma.primary.create({
    data: {
      id: channel.id,
      creator: userId,
    },
  });
  await debug(
    `New primary channel ${primary.id} created by ${primary.creator}.`
  );
};

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
  await Promise.all([
    prisma.secondary.delete({ where: { id } }),
    channel?.delete(),
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
 * Deletes Primary Channel.,Only deletes db entries. (for discord deleted event)
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletePrimary = async (
  channel: BaseGuildVoiceChannel,
  channelId: string
) => {
  const channelConfig = await prisma.primary.findUnique({
    where: { id: channelId },
  });
  if (!channel?.deletable || !channelConfig) return;
  await Promise.all([
    prisma.primary.delete({ where: { id: channelId } }),
    channel?.delete(),
    // TODO: Delete secondary discord channels
  ]);
  await debug(`Primary channel ${channelId} deleted.`);
};

/**
 * Deleted Primary Channel. Only deletes db entries. (for discord deleted event)
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletedPrimary = async (channelId: string) => {
  const channel = await prisma.primary.findUnique({
    where: { id: channelId },
  });
  if (!channel) return;
  await prisma.primary.delete({ where: { id: channelId } });
  await debug(`Primary channel ${channelId} deleted.`);
};

// TODO: Delete secondary discord channels

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
  const primaryChannel = await prisma.primary.findUnique({
    where: { id: primaryId },
    include: { aliases: true, secondaries: true },
  });

  if (!primaryChannel) return;
  const channel = await channelManager.fetch(primaryId);
  if (!primaryChannel || !channel) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const secondary = await channelManager.create(
    formatString({
      str: primaryChannel.template,
      general_template: primaryChannel.generalName,
      creator: primaryChannel.creator,
      template: primaryChannel.template,
      channelNumber: primaryChannel.secondaries.length + 1,
      activities: activities,
      aliases: primaryChannel.aliases,
    }),
    {
      type: "GUILD_VOICE",
      parent: channel?.parent ? channel.parent : undefined,
      position: channel?.position ? channel.position + 1 : undefined,
    }
  );
  secondary.setPosition(channel?.position + 1);
  if (secondary.parent) {
    secondary.lockPermissions();
  }
  if (member) {
    member.voice.setChannel(secondary);
  }

  await prisma.secondary.create({
    data: {
      id: secondary.id,
      primaryId,
    },
  });
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 5 },
      new Task(secondary.id, () => refreshSecondary(secondary))
    )
  );
  await updateActivityCount(channelManager.client);
  await debug(`Secondary channel ${secondary.id} created by ${member?.id}`);
};

/**
 * Retrieves data from db and changes channel name with formatting.
 * @param id Secondary channel id.
 * @param channelManager Discord Channel Manager
 * @returns nothing.
 */
export const refreshSecondary = async (channel: BaseGuildVoiceChannel) => {
  const { id } = channel;
  const channelConfig = await prisma.secondary.findUnique({
    where: { id },
  });
  if (!channelConfig) return;
  const primaryConfig = await prisma.primary.findUnique({
    where: { id: channelConfig.primaryId },
    include: { aliases: true },
  });
  if (!channelConfig || !primaryConfig) return;

  if (!channel?.manageable) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const str = channelConfig.name
    ? channelConfig.name
    : activities
    ? primaryConfig.template
    : primaryConfig.generalName;
  channel.edit({
    name: formatString({
      str,
      general_template: primaryConfig.generalName,
      name: channelConfig.name ? channelConfig.name : undefined,
      creator: primaryConfig.creator,
      template: primaryConfig.template,
      aliases: primaryConfig.aliases,
      channelNumber: 1,
      activities,
    }),
  });
  await debug(`Secondary channels from primary ${primaryConfig.id} refreshed.`);
};

/**
 * Refresh Channel Activity Count
 */
export const updateActivityCount = (client: Client) => {
  return prisma.secondary.count().then((count) => {
    client.user?.setActivity(
      `with ${count} ${count === 1 ? "channel" : "channels"}.`
    );
  });
};

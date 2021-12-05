import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { debug } from "../colourfulLogger";
import { formatString } from "../formatString";
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
  const cachedChannel = channelManager.cache.get(primaryId);
  const channel = cachedChannel
    ? cachedChannel
    : await channelManager.fetch(primaryId);
  if (!primaryChannel || !channel || !channel.isVoice()) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const str = !activities.length
    ? primaryChannel.generalName
    : primaryChannel.template;
  const secondary = await channelManager.create(
    formatString({
      str,
      creator: primaryChannel.creator,
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
    : !activities.length
    ? primaryConfig.generalName
    : primaryConfig.template;
  channel.edit({
    name: formatString({
      str,
      creator: primaryConfig.creator,
      aliases: primaryConfig.aliases,
      channelNumber: 1,
      activities,
    }),
  });
  await debug(`Secondary channels from primary ${primaryConfig.id} refreshed.`);
};

import { Secondary } from "@prisma/client";
import { ChannelManager, GuildChannelManager, GuildMember } from "discord.js";
import { formatString } from "./formatString";
import { prisma } from "./prisma";

/**
 * Deletes Secondary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deleteSecondary = async (
  channelManager: GuildChannelManager,
  channelId: string
) => {
  const channel = await channelManager.fetch(channelId);
  const channelConfig = await prisma.secondary.findUnique({
    where: { id: channelId },
  });
  if (channel?.members.size !== 0 || !channel?.deletable || !channelConfig)
    return;
  return Promise.all([
    prisma.secondary.delete({ where: { id: channelId } }),
    channel?.delete(),
  ]);
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
  return prisma.secondary.delete({ where: { id: channelId } });
};

/**
 * Deletes Primary Channel.,Only deletes db entries. (for discord deleted event)
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletePrimary = async (
  channelManager: GuildChannelManager,
  channelId: string
) => {
  const channelConfig = await prisma.primary.findUnique({
    where: { id: channelId },
  });
  const channel = await channelManager.fetch(channelId);
  if (!channel?.deletable || !channelConfig) return;
  return Promise.all([
    prisma.primary.delete({ where: { id: channelId } }),
    channel?.delete(),
    // TODO: Delete secondary discord channels
  ]);
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
  return prisma.primary.delete({ where: { id: channelId } });
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
    include: { aliases: true },
  });

  if (!primaryChannel) return;

  const discordChannel = await channelManager.fetch(primaryId);
  if (!primaryChannel || !discordChannel) return;
  const activities = Array.from(discordChannel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const secondary = await channelManager.create(
    formatString({
      str: primaryChannel.template,
      general_template: primaryChannel.generalName,
      creator: primaryChannel.creator,
      template: primaryChannel.template,
      channelNumber: 1,
      activities: activities,
      aliases: primaryChannel.aliases,
    }),
    {
      type: "GUILD_VOICE",
      parent: discordChannel?.parent ? discordChannel.parent : undefined,
      position: discordChannel?.position
        ? discordChannel.position + 1
        : undefined,
    }
  );
  await secondary.setPosition(discordChannel?.position + 1);
  if (member) {
    await member.voice.setChannel(secondary);
  }
  await prisma.secondary.create({
    data: {
      id: secondary.id,
      primaryId,
    },
  });
};

/**
 * Retrieves data from db and changes channel name with formatting.
 * @param id Secondary channel id.
 * @param channelManager Discord Channel Manager
 * @returns nothing.
 */
export const refreshSecondary = async (
  id: string,
  channelManager: GuildChannelManager
) => {
  const channelConfig = await prisma.secondary.findUnique({
    where: { id },
  });
  const primaryConfig = await prisma.primary.findUnique({
    where: { id: channelConfig?.primaryId },
    include: { aliases: true },
  });
  if (!channelConfig || !primaryConfig) return;
  const channel = await channelManager.fetch(id);
  if (!channel?.manageable) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  channel.edit({
    name: formatString({
      str: primaryConfig.template,
      general_template: primaryConfig.generalName,
      name: channelConfig.name ? channelConfig.name : undefined,
      creator: primaryConfig.creator,
      template: primaryConfig.template,
      aliases: primaryConfig.aliases,
      channelNumber: 1,
      activities,
    }),
  });
};

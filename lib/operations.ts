import { GuildChannelManager, GuildMember } from "discord.js";
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
 * Deletes Primary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletePrimary = async (
  channelManager: GuildChannelManager,
  channelId: string
) => {
  const channelConfig = await prisma.primaryChannel.findUnique({
    where: { id: channelId },
  });
  const channel = await channelManager.fetch(channelId);
  if (!channel?.deletable || !channelConfig) return;
  return Promise.all([
    prisma.primaryChannel.delete({ where: { id: channelId } }),
    channel?.delete(),
    // TODO: Delete secondary discord channels
  ]);
};

/**
 *
 * @param channelManager Discord's Channel Manager.
 * @param primaryChannelId ID of the primary channel to link to.
 * @param member The user (if they're specified) to be moved to the new channel.
 * @returns
 */
export const createSecondary = async (
  channelManager: GuildChannelManager,
  primaryChannelId: string,
  member?: GuildMember
) => {
  const primaryChannel = await prisma.primaryChannel.findUnique({
    where: { id: primaryChannelId },
  });

  if (!primaryChannel) return;

  const discordChannel = await channelManager.fetch(primaryChannelId);
  if (!primaryChannel || !discordChannel) return;

  const secondary = await channelManager.create(
    primaryChannel?.template || "Secondary Channel",
    {
      type: "GUILD_VOICE",
      position: discordChannel?.position
        ? discordChannel.position + 1
        : undefined,
    }
  );
  if (member) {
    await member.voice.setChannel(secondary);
  }
  await prisma.secondary.create({
    data: {
      id: secondary.id,
      primaryChannelId,
    },
  });
};

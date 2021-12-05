import { BaseGuildVoiceChannel, GuildChannelManager } from "discord.js";
import { debug } from "../colourfulLogger";
import { prisma } from "../prisma";

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
    prisma.primary.delete({
      where: { id: channelId },
      include: { secondaries: true, aliases: true },
    }),
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
  await prisma.primary.delete({
    where: { id: channelId },
    include: { aliases: true, secondaries: true },
  });
  await debug(`Primary channel ${channelId} deleted.`);
};

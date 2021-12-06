import { APIInteractionDataResolvedChannel } from "discord-api-types";
import {
  BaseGuildVoiceChannel,
  GuildChannel,
  GuildChannelManager,
  ThreadChannel,
} from "discord.js";
import { debug } from "../colourfulLogger";
import { prisma } from "../prisma";

/**
 * Create Primary Channel
 * @param channelManager - Discord Channel Manager
 * @param userId - The user who created the channel
 * @param section - If it exists, the parent channel it should be assigned to
 * @returns Promise
 */
export const createPrimary = async (
  channelManager: GuildChannelManager,
  userId: string,
  section?:
    | GuildChannel
    | ThreadChannel
    | APIInteractionDataResolvedChannel
    | null
) => {
  const parent = section?.id;
  const channel = await channelManager.create("➕ New Session", {
    type: "GUILD_VOICE",
    parent,
  });

  const primary = await prisma.primary.create({
    data: {
      id: channel.id,
      creator: userId,
    },
  });
  await debug(
    `New primary channel ${channel.name} created by ${primary.creator}.`
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
  ]);
  await debug(
    `Primary channel ${channel.name} in ${channel.guild.name} deleted.`
  );
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
  await debug(`Primary channel ${channel.id} deleted.`);
};

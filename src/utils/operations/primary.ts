import { Prisma } from "@prisma/client";
import { APIInteractionDataResolvedChannel } from "discord-api-types";
import {
  BaseGuildVoiceChannel,
  GuildChannel,
  GuildChannelManager,
  ThreadChannel,
} from "discord.js";
import { db } from "../db";
import { logger } from "../logger";

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
  try {
    const parent = section?.id;
    const channel = await channelManager.create("➕ New Session", {
      type: "GUILD_VOICE",
      parent,
    });
    const primary = await db.primary.create({
      data: {
        id: channel.id,
        creator: userId,
        guildId: channelManager.guild.id,
      },
    });

    logger.debug(
      `New primary channel ${channel.name} created by ${primary.creator}.`
    );
    return channel;
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Deletes Primary Channel.,Only deletes db entries. (for discord deleted event)
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deleteDiscordPrimary = async (
  channel: BaseGuildVoiceChannel,
  channelId: string
) => {
  try {
    const channelConfig = await db.primary.findUnique({
      where: { id: channelId },
    });
    if (!channel?.deletable || !channelConfig) return;
    try {
      await Promise.all([
        db.primary.delete({
          where: { id: channelId },
          include: { secondaries: true },
        }),

        channel?.delete(),
      ]);
    } catch (error) {
      logger.error("Failed primary deletion.");
    }

    logger.debug(
      `Primary channel ${channel.name} in ${channel.guild.name} deleted.`
    );
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Deleted Primary Channel. Only deletes db entries. (for discord deleted event)
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletedPrimary = async (channelId: string) => {
  try {
    const primary = await db.primary.delete({
      where: { id: channelId },
      include: { secondaries: true },
    });
    logger.debug(`Primary channel ${primary.id} deleted.`);
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Updates the db entry for a primary channel.
 * @param channelId
 * @param data
 */
export const updatePrimary = async (channelId: string, data: any) => {
  try {
    const primary = await db.primary.update({
      data,
      where: { id: channelId },
    });
    logger.debug(`Primary channel ${primary.id} updated.`);
  } catch (error) {
    logger.error(error);
  }
};

export const getPrimary = async (
  id: string,
  include?: Prisma.PrimaryInclude
) => {
  try {
    return await db.primary.findUnique({
      where: { id },
      include,
    });
  } catch (error) {
    logger.error(error);
  }
};

export const deletePrimary = async (
  id: string,
  include?: Prisma.PrimaryInclude
) => {
  try {
    return await db.primary.delete({
      where: { id },
      include,
    });
  } catch (error) {
    logger.error();
  }
};

import Prisma from "@prisma/client";
import { Client, Guild, GuildChannel, User, VoiceChannel } from "discord.js";
import { db } from "../utils/db";
import { logger } from "../utils/logger";

export default class DynamicaPrimary {
  /** The secondary channel as defined by prisma */
  prisma: Prisma.Primary & {
    guild: Prisma.Guild;
    secondaries: Prisma.Secondary[];
  };
  /** The discord channel as defined by discord */
  discord: VoiceChannel;
  /** The discordjs client instance */
  client: Client<true>;
  /** The channel id as set in fetch */
  id: string;
  /** The discord guild */
  discordGuild: Guild;
  /** The prisma guild */
  prismaGuild: Prisma.Guild;

  constructor(client: Client<true>) {
    this.client = client;
  }

  /**
   * Create a new primary channel
   * @param guild The guild
   * @param user The user who ran the command
   * @param section The section that the channel should be assigned to
   */
  async create(
    guild: Guild,
    user: User,
    section?: GuildChannel
  ): Promise<DynamicaPrimary> {
    try {
      const parent = section?.id;
      const channel = await guild.channels.create("➕ New Session", {
        type: "GUILD_VOICE",
        parent,
      });
      const primary = await db.primary.create({
        data: {
          id: channel.id,
          creator: user.id,
          guildId: guild.id,
        },
      });

      logger.debug(
        `New primary channel ${channel.name} created by ${primary.creator}.`
      );
      await this.fetch(channel.id);
    } catch (error) {
      logger.error("Error creating new primary channel:", error);
    }
    return this;
  }

  /**
   * Checks the database to see if the channel exists
   * @param id The channel Id
   * @returns boolean based on if a primary channel exists within the database
   */
  async exists(id: string): Promise<boolean> {
    let primary = await db.primary.findUnique({
      where: { id },
    });
    if (!!primary) {
      this.id = id;
    }
    return !!primary;
  }

  /**
   * Fetch the database entry and discord channels (voice and text).
   * @param channelId The discord channel Id.
   */
  async fetch(channelId?: string): Promise<DynamicaPrimary | undefined> {
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (channelId) {
      this.id = channelId;
    }
    let primary = await db.primary.findUnique({
      where: { id: this.id },
    });
    if (!primary) {
      return undefined;
    }
    try {
      let primary = await db.primary.findUnique({
        where: { id: this.id },
        include: { guild: true, secondaries: true },
      });

      if (!primary) return undefined;
      this.prisma = primary;
      this.prismaGuild = primary.guild;
    } catch (error) {
      logger.error("Error fetching primary channel from database:", error);
    }
    try {
      let channel = await this.client.channels.fetch(this.id);

      if (!channel.isVoice()) {
        throw new Error("Not a valid voice channel.");
      } else if (channel.type === "GUILD_STAGE_VOICE") {
        throw new Error("Not a valid voice channel (Stage)");
      } else {
        this.discord = channel;
        this.discordGuild = channel.guild;
      }
    } catch (error) {
      logger.error("Error fetching primary channel from discord:", error);
    }
    return this;
  }

  /**
   * Delete a primary channel
   */
  async delete(): Promise<void> {
    // TODO: if discord channel or db don't exist then ignore
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.prisma) {
      throw new Error("Please fetch");
    }
    if (!this.discord) {
      throw new Error("Please fetch");
    }
    try {
      await db.primary.delete({ where: { id: this.id } });
      await this.discord.delete();
    } catch (error) {
      logger.error("Failed to delete primary:", error);
    }
  }
}

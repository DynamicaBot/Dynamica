import db from "@db";
import Prisma from "@prisma/client";
import logger from "@utils/logger";
import { Client, Guild, GuildChannel, User, VoiceChannel } from "discord.js";
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

  constructor(client: Client<true>, channelId?: string) {
    this.client = client;
    if (channelId) {
      this.id = channelId;
    }
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
      await this.fetch();
    } catch (error) {
      logger.error("Error creating new primary channel:", error);
    }
    return this;
  }

  /**
   * Fetch the database entry and discord channels (voice and text).
   * @param channelId The discord channel Id.
   */
  async fetch(): Promise<DynamicaPrimary | undefined> {
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.id) {
      throw new Error("No id defined");
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
      let channel = await this.client.channels.cache.get(this.id);
      if (!channel) {
        this.delete();
        return undefined;
      }
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
   * Delete a primary discord channel. DB & Discord Channel.
   */
  async delete(): Promise<void> {
    await this.fetch();
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.discord) {
      try {
        await this.deletePrisma();
      } catch (error) {
        logger.error("Failed to delete prisma secondary entry:", error);
      }
    } else if (!this.prisma) {
      try {
        await this.deleteDiscord();
      } catch (error) {
        logger.error("Failed to delete discord secondary:", error);
      }
    } else if (this.discord && this.prisma) {
      try {
        await this.deletePrisma();
        await this.deleteDiscord();
      } catch (error) {
        logger.error("Failed to delete secondary:", error);
      }
    }
  }

  private async deletePrisma(): Promise<void> {
    if (!this.id) {
      throw new Error("No id defined.");
    }
    await db.primary.delete({ where: { id: this.id } });
  }

  private async deleteDiscord(): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined.");
    }
    if (!this.id) {
      throw new Error("No Id defined.");
    }
    try {
      if (!this.discord.deletable) {
        throw new Error("The channel is not deletable.");
      }

      await this.discord.delete();

      logger.debug(`Primary channel deleted ${this.id}.`);
    } catch (error) {
      logger.error("Failed to delete primary:", error);
    }
  }
}

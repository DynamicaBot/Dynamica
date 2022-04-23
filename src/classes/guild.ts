import db from '@db';
import { Alias, Guild as PrismaGuild } from '@prisma/client';
import logger from '@utils/logger';
import { Client, Guild as DiscordGuild } from 'discord.js';

export default class DynamicaGuild {
  private client: Client<true>;

  private id: string;

  public discord: DiscordGuild;

  public prisma: PrismaGuild & { aliases: Alias[] };

  constructor(client: Client<true>, id?: string) {
    this.client = client;
    if (id) {
      this.id = id;
    }
  }

  /**
   * Fetch the guild db & discord
   * @returns this
   */
  async fetch() {
    if (!this.client) {
      throw new Error('No client defined.');
    }
    if (!this.id) {
      throw new Error('No Id defined.');
    }
    try {
      const guild = await db.guild.findUnique({
        where: { id: this.id },
        include: { aliases: true },
      });
      const discordGuild = await this.client.guilds.cache.get(this.id);
      if (guild && discordGuild) {
        this.prisma = guild;
        this.discord = discordGuild;
      }
      return undefined;
    } catch (error) {
      logger.error("Couldn't fetch guild:", error);
    }
    return this;
  }

  /**
   * Change the setting allowing people to request to join a locked channel.
   * @param enabled the state to set the setting to
   * @returns this
   */
  async setAllowJoin(enabled: boolean) {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.id) {
      throw new Error('No Id defined');
    }
    const updatedGuild = await db.guild.update({
      where: { id: this.id },
      include: {
        aliases: true,
      },
      data: {
        allowJoinRequests: enabled,
      },
    });

    this.prisma = updatedGuild;
    return this;
  }

  /**
   * Change the setting for creating new text channels automatically.
   * @param enabled the state to set the setting to
   * @returns this
   */
  async setTextEnabled(enabled: boolean) {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.id) {
      throw new Error('No Id defined');
    }
    const updatedGuild = await db.guild.update({
      where: { id: this.id },
      include: { aliases: true },
      data: {
        textChannelsEnabled: enabled,
      },
    });

    this.prisma = updatedGuild;
    return this;
  }
}

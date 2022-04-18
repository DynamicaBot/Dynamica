import db from '@db';
import { Alias, Guild as PrismaGuild } from '@prisma/client';
import logger from '@utils/logger';
import { Client, Guild as DiscordGuild, Guild } from 'discord.js';

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
      const guild = await this.fetchPrisma();
      const discordGuild = await this.fetchDiscord();
      if (guild && discordGuild) {
        this.prisma = guild;
        this.discord = discordGuild;
      }
    } catch (error) {
      logger.error("Couldn't fetch guild:", error);
    }
    return this;
  }

  async fetchPrisma(): Promise<
    PrismaGuild & {
      aliases: Alias[];
    }
  > {
    const guild = await db.guild.findUnique({
      where: { id: this.id },
      include: { aliases: true },
    });
    if (!guild) {
      logger.info('fetch prisma');
      return db.guild.create({
        data: { id: this.id },
        include: { aliases: true },
      });
    } else {
      return guild;
    }
  }

  async fetchDiscord(): Promise<DiscordGuild> {
    const discord = await this.client.guilds.cache.get(this.id);
    if (!discord) {
      this.deletePrisma();
      return undefined;
    }
    return discord;
  }

  async deletePrisma(): Promise<PrismaGuild | undefined> {
    const guild = await db.guild.findUnique({ where: { id: this.id } });
    if (!guild) {
      return undefined;
    }
    return db.guild.delete({ where: { id: this.id } });
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
    this.prisma = await db.guild.update({
      where: { id: this.id },
      include: {
        aliases: true,
      },
      data: {
        allowJoinRequests: enabled,
      },
    });
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
    this.prisma = await db.guild.update({
      where: { id: this.id },
      include: { aliases: true },
      data: {
        textChannelsEnabled: enabled,
      },
    });
    return this;
  }

  /**
   * Create a guild entry in prisma
   */
  async create(id: Guild['id']) {
    return db.guild.create({
      data: {
        id,
      },
    });
  }
}

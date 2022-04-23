import logger from '@/utils/logger';
import Prisma from '@prisma/client';
import { Client, Guild, VoiceChannel } from 'discord.js';

interface DynamicaChannelTypes {
  primary: {
    prisma: Prisma.Primary & {
      guild: Prisma.Guild;
      secondaries: Prisma.Secondary[];
    };
  };
  secondary: {
    prisma: Prisma.Secondary & { guild: Prisma.Guild; primary: Prisma.Primary };
  };
}

export default class DynamicaChannel<K extends keyof DynamicaChannelTypes> {
  /** The discord channel */
  discord: VoiceChannel;

  /** The discordjs client instance */
  client: Client<true>;

  /** The channel id as set in fetch */
  id: string;

  /** The discord guild */
  discordGuild: Guild;

  /** The prisma guild */
  prismaGuild: Prisma.Guild;

  /** The prisma entry */
  prisma: DynamicaChannelTypes[K]['prisma'];

  constructor(client: Client<true>, channelId?: string) {
    this.client = client;
    if (channelId) {
      this.id = channelId;
      this.fetch();
    }
  }

  async create(...args) {
    return this;
  }
  async fetch(): Promise<DynamicaChannel<K> | undefined> {
    try {
      if (!this.client) {
        throw new Error('No client defined');
      }
      if (!this.id) {
        throw new Error('No id defined');
      }
      const channel = await this.fetchDiscord();
      const prisma = await this.fetchPrisma();
      if (!channel) {
        this.deletePrisma();
        return undefined;
      }
      if (!prisma) {
        return undefined;
      }
      this.prisma = prisma;
      this.discord = channel;

      return this;
    } catch (error) {
      logger.error(error.toString());
    }
  }
  async delete() {
    this.deletePrisma();
    this.deleteDiscord();
  }

  async fetchPrisma(): Promise<DynamicaChannelTypes[K]['prisma'] | undefined> {
    return this.prisma;
  }

  /** Get the discord channel */
  async fetchDiscord(): Promise<VoiceChannel | undefined> {
    const channel = await this.client.channels.cache.get(this.id);
    if (!channel || channel.type !== 'GUILD_VOICE') {
      return undefined;
    }
    return channel;
  }

  async deletePrisma(): Promise<void> {}
  async deleteDiscord(): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined.');
    }
    if (!this.id) {
      throw new Error('No Id defined.');
    }
    try {
      if (!this.discord.deletable) {
        throw new Error('The channel is not deletable.');
      }

      await this.discord.delete();

      logger.debug(`Primary channel deleted ${this.id}.`);
    } catch (error) {
      logger.error('Failed to delete primary:', error);
    }
  }
}

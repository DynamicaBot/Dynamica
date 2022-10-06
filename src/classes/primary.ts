import db from '@db';
import Prisma from '@prisma/client';
import logger from '@utils/logger';
import { ChannelType, Guild, GuildChannel, User } from 'discord.js';
import DynamicaChannel from './dynamicaChannel';

export default class DynamicaPrimary extends DynamicaChannel<'primary'> {
  /** The secondary channel as defined by prisma */
  declare prisma: Prisma.Primary & {
    guild: Prisma.Guild;
    secondaries: Prisma.Secondary[];
  };

  /**
   * Create a new primary channel
   * @param guild The guild
   * @param user The user who ran the command
   * @param section The section that the channel should be assigned to
   */
  async create(guild: Guild, user: User, section?: GuildChannel) {
    try {
      const parent = section?.id;

      const channel = await guild.channels.create({
        type: ChannelType.GuildVoice,
        name: '➕ New Session',
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
      this.id = channel.id;
      await this.fetch();
    } catch (error) {
      logger.error('Error creating new primary channel:', error);
    }
    return this;
  }

  async fetchPrisma() {
    const prisma = await db.primary.findUnique({
      where: { id: this.id },
      include: { guild: true, secondaries: true },
    });

    if (!prisma) {
      return undefined;
    }
    return prisma;
  }

  /**
   * Delete a primary discord channel. DB & Discord Channel.
   */
  async delete(): Promise<void> {
    await this.fetch();
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.discord) {
      try {
        await this.deletePrisma();
      } catch (error) {
        logger.error('Failed to delete prisma secondary entry:', error);
      }
    } else if (!this.prisma) {
      try {
        await this.deleteDiscord();
      } catch (error) {
        logger.error('Failed to delete discord secondary:', error);
      }
    } else if (this.discord && this.prisma) {
      try {
        await this.deletePrisma();
        await this.deleteDiscord();
      } catch (error) {
        logger.error('Failed to delete secondary:', error.toString());
      }
    }
  }

  async deletePrisma(): Promise<void> {
    if (!this.id) {
      throw new Error('No id defined.');
    }
    const prisma = await this.fetchPrisma();
    if (prisma) {
      await db.primary.delete({ where: { id: this.id } });
    }
  }
}

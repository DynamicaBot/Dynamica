import DynamicaPrimary from '@classes/primary';
import db from '@db';
import Prisma, { Primary } from '@prisma/client';
import updateActivityCount from '@utils';
import formatChannelName from '@utils/format';
import logger from '@utils/logger';
import { Guild, GuildMember, User } from 'discord.js';
import DynamicaChannel from './dynamicaChannel';

export default class DynamicaSecondary extends DynamicaChannel<'secondary'> {
  /** The secondary channel as defined by prisma */
  // declare prisma: Prisma.Secondary & { guild: Guild; primary: Primary };

  /** The prisma primary */
  prismaPrimary: Prisma.Primary;

  /**
   * Create a secondary channel.
   * @param primary primary parent channel
   * @param guild discord guild
   * @param member guild member who created the channel
   * @returns
   */
  async create(primary: DynamicaPrimary, guild: Guild, member: GuildMember) {
    try {
      await primary.fetch();

      const primaryConfig = primary.prisma;

      const aliases = await db.alias.findMany({
        where: { guildId: guild.id },
      });

      const activities = Array.from(
        primary.discord.members.filter(
          (discordMember) => !discordMember.user.bot
        )
      ).flatMap((entry) => {
        if (!entry[1].presence) return [];
        return entry[1].presence?.activities.map((activity) => activity.name);
      });

      const filteredActivityList = activities
        .filter((activity) => activity !== 'Spotify')
        .filter((activity) => activity !== 'Custom Status');

      const str = !filteredActivityList.length
        ? primaryConfig.generalName
        : primaryConfig.template;

      const secondary = await guild.channels.create(
        formatChannelName(str, {
          creator: member?.displayName as string,
          channelNumber: primaryConfig.secondaries.length + 1,
          activities: filteredActivityList,
          aliases,
          memberCount: primary.discord.members.size,
          locked: false,
        }),
        {
          type: 'GUILD_VOICE',
          parent: primary.discord.parent ?? undefined,
          position: primary.discord.position
            ? primary.discord.position + 1
            : undefined,
          bitrate: primary.discord.bitrate ?? undefined,
        }
      );

      if (secondary.parent && primary.discord.permissionsLocked) {
        secondary.lockPermissions();
      }

      await member.voice.setChannel(secondary);

      db.secondary
        .create({
          data: {
            id: secondary.id,
            creator: member.id,
            primaryId: primary.id,
            guildId: guild.id,
          },
          include: { guild: true, primary: true },
        })
        .then(async (channel) => {
          this.id = secondary.id;
          this.prisma = channel;
          this.prismaGuild = channel.guild;
          this.prismaPrimary = channel.primary;

          updateActivityCount(this.client);
        });

      logger.debug(
        `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${guild.name}.`
      );
      this.discord = secondary;
    } catch (error) {
      logger.error(error);
    }
    return this;
  }

  /**
   * Fetch the database entry and discord channels.
   * @param channelId The discord channel Id.
   */
  async fetch() {
    // Variables
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.id) {
      throw new Error('No Id defined');
    }

    const prisma = await this.fetchPrisma();
    const discord = await this.fetchDiscord();
    if (!discord) {
      await this.delete();
      return undefined;
    }
    if (!prisma) {
      return undefined;
    }
    this.prisma = prisma;
    this.prismaGuild = prisma.guild;
    this.prismaPrimary = prisma.primary;
    this.discord = discord;

    return this;
  }

  async fetchPrisma(): Promise<
    Prisma.Secondary & { guild: Prisma.Guild; primary: Primary }
  > {
    const prisma = await db.secondary.findUnique({
      where: { id: this.id },
      include: { guild: true, primary: true },
    });
    return prisma;
  }

  /**
   * Update secondary channel, changing name if required.
   */
  async update() {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.discord || this.discord.members.size === 0) {
      this.delete();
    } else {
      try {
        await this.fetch();
        const secondary = this.prisma;

        const secondaries = await db.secondary.findMany({
          where: { primaryId: secondary.primaryId, guildId: secondary.guildId },
        });

        /**
         * Return aliases
         */
        const aliases = await db.alias.findMany({
          where: {
            guildId: this.prismaGuild.id,
          },
        });

        /**
         * The name of the creator based on the config
         */
        const channelCreator = secondary.creator
          ? this.discord.members.get(secondary.creator)?.displayName
          : undefined;

        /**
         * The creator or, alternatively the person who will become the creator.
         */
        const creator =
          channelCreator || this.discord.members.at(0)?.displayName;

        /**
         * Get the activities of all the members of the channel.
         */
        const activities = Array.from(this.discord.members).flatMap((entry) => {
          if (!entry[1].presence) return [];
          return entry[1].presence?.activities.map((activity) => activity.name);
        });

        /**
         * The activities list minus stuff that should be ignored like Spotify and Custom status // Todo: more complicated logic for people who might be streaming
         */
        const filteredActivityList = activities
          .filter((activity) => activity !== 'Spotify')
          .filter((activity) => activity !== 'Custom Status');
        const { locked } = secondary;

        /**
         * The template to be used.
         */
        const str =
          secondary.name ??
          (!filteredActivityList.length
            ? this.prismaPrimary.generalName
            : this.prismaPrimary.template);
        const channelNumber =
          secondaries
            .map((secondaryChannel) => secondaryChannel.id)
            .indexOf(secondary.id) + 1;

        /**
         * The formatted name
         */
        const name = formatChannelName(str, {
          creator: creator || '',
          aliases,
          channelNumber,
          activities: filteredActivityList,
          memberCount: this.discord.members.size, // Get this
          locked,
        });

        if (this.discord.name !== name) {
          if (!this.discord.manageable) {
            throw new Error('Channel not manageable');
          }
          this.discord
            .edit({
              name,
            })
            .then(() => {
              logger.debug(
                `Secondary channel ${this.discord.name} in ${this.discord.guild.name} name changed.`
              );
            });
        }
      } catch (error) {
        logger.error(error);
      }
    }
  }

  /**
   * Delete a secondary discord channel. DB & Discord Channel.
   */
  async delete(): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.id) {
      logger.debug('No id');
    }

    try {
      const discord = await this.fetchDiscord();
      const prisma = await this.fetchPrisma();
      if (discord) {
        await this.deleteDiscord();
      }
      if (prisma) {
        await this.deletePrisma();
      }
      // console.trace();
      logger.debug(`Secondary channel deleted ${this.id}.`);
    } catch (error) {
      logger.error(error);
    }
  }

  async deletePrisma(): Promise<void> {
    if (!this.id) {
      throw new Error('No id defined.');
    }
    const prisma = await this.fetchPrisma();
    if (prisma) {
      await db.secondary
        .delete({ where: { id: this.id } })
        .then(() => {
          updateActivityCount(this.client);
        })
        .catch((error) =>
          logger.error('Failed to delete secondary:', error.toString())
        );
    }
  }

  async deleteDiscord(): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined.');
    }
    if (!this.id) {
      throw new Error('No Id defined.');
    }
    try {
      const discord = await this.fetchDiscord();
      if (discord) {
        await discord.delete();
      }
    } catch (error) {
      logger.error('Failed to delete secondary:', error.toString());
    }
  }

  async lock(): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.discord || !this.prisma) {
      throw new Error('Please fetch');
    }
    try {
      const { everyone } = this.discord.guild.roles;
      const currentlyActive = [...this.discord.members.values()];

      const { permissionOverwrites } = this.discord;

      await Promise.all(
        currentlyActive.map((member) =>
          permissionOverwrites.create(member.id, {
            CONNECT: true,
          })
        )
      ).then(() => {
        if (everyone) {
          permissionOverwrites.create(everyone.id, { CONNECT: false });
        }
      });

      await db.secondary.update({
        where: { id: this.discord.id },
        data: {
          locked: true,
        },
      });

      await this.update();
    } catch (error) {
      logger.error('Failed to lock channel:', error.toString());
    }
  }

  async unlock(): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.discord || !this.prisma) {
      throw new Error('Please fetch');
    }
    try {
      await this.discord.lockPermissions();

      await db.secondary.update({
        where: { id: this.discord.id },
        data: {
          locked: false,
        },
      });

      await this.update();
    } catch (error) {
      logger.error('Failed to unlock channel:', error.toString());
    }
  }

  async changeOwner(user: User): Promise<void> {
    if (!this.client) {
      throw new Error('No client defined');
    }
    if (!this.discord || !this.prisma) {
      throw new Error('Please fetch');
    }
    try {
      await db.secondary.update({
        where: { id: this.id },
        data: { creator: user.id },
      });
    } catch (error) {
      logger.error('Failed to set owner of channel:', error.toString());
    }
    this.fetch();
  }
}

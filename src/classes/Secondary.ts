// eslint-disable-next-line import/no-cycle
import channelActivities from '@/utils/activity';
// eslint-disable-next-line import/no-cycle
import updatePresence from '@/utils/presence';
import DB from '@/services/DB';
import formatChannelName from '@/utils/format';
import Logger from '@/services/Logger';
import { DiscordAPIError, GuildMember, User } from 'discord.js';
import { Container, Service } from 'typedi';
import Client from '@/services/Client';
// eslint-disable-next-line import/no-cycle
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
// eslint-disable-next-line import/no-cycle
import MQTT from '@/services/MQTT';
// eslint-disable-next-line import/no-cycle
import Secondaries from './Secondaries';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
@Service()
export default class DynamicaSecondary {
  id: string;

  guildId: string;

  /** The prisma primary */
  parentId: string;

  constructor(
    channelId: string,
    guildId: string,
    primaryId: string,
    private db: DB,
    private client: Client,
    private logger: Logger,
    private mqtt: MQTT
  ) {
    this.guildId = guildId;
    this.id = channelId;
    this.parentId = primaryId;
  }

  /**
   * Create a secondary channel.
   * @param primary primary parent channel
   * @param member guild member who created the channel
   * @returns
   */
  async addMember(member: GuildMember): Promise<void> {
    const channel = await this.discord();
    if (channel) {
      await member.voice.setChannel(channel);
    }
  }

  /**
   * Update secondary channel, changing name if required.
   */
  async update() {
    try {
      const discordChannel = await this.discord();
      if (!discordChannel.manageable) {
        this.logger
          .scope('Secondary', this.id, 'update')
          .warn('Secondary channel is not manageable.');
        return;
      }
      if (!discordChannel) return;
      if (discordChannel.members.size === 0) {
        await this.delete();
        return;
      }
      const prismaChannel = await this.prisma();

      const primaryPrisma = await this.db.primary.findUnique({
        where: { id: this.parentId },
      });

      const adjacentSecondaryCount = await this.db.secondary.count({
        where: {
          primaryId: discordChannel.parentId,
          guildId: discordChannel.guildId,
        },
      });

      const { emoji } = prismaChannel;

      /**
       * Return aliases
       */
      const aliases = await this.db.alias.findMany({
        where: {
          guildId: discordChannel.guildId,
        },
      });

      /**
       * The activities list minus stuff that should be ignored like Spotify and Custom status // Todo: more complicated logic for people who might be streaming
       */
      const activities = channelActivities(discordChannel);

      const { locked } = prismaChannel;

      /**
       * The template to be used.
       */
      const str =
        prismaChannel.name ??
        (!activities.length
          ? primaryPrisma.generalName
          : primaryPrisma.template);

      const guild = await this.client.guilds.fetch(prismaChannel.guildId);

      const creator = await guild.members.fetch(prismaChannel.creator);

      /**
       * The formatted name
       */
      const name = formatChannelName(str, {
        creator: creator.displayName,
        aliases,
        channelNumber: adjacentSecondaryCount + 1,
        activities,
        memberCount: discordChannel.members.size, // Get this
        emoji,
        locked,
      });
      const oldName = discordChannel.name;
      if (discordChannel.name !== name && name.length <= 100) {
        try {
          await discordChannel.edit({
            name,
          });
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            if (error.code === 50013) {
              await this.delete();
            } else if (error.code === 10003) {
              await this.delete(false, true);
            } else {
              this.logger.scope('Secondary', this.id, 'update').error(error);
            }
          }
        }

        this.logger
          .scope('Secondary', this.id, 'update')
          .debug(
            `Secondary channel in ${discordChannel.guild.name} name changed from ${oldName} to ${name}.`
          );
      }
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === 10003) {
          await this.delete(false, true);
        }
      } else if (error instanceof PrismaClientKnownRequestError) {
        // this.logger
        //   .scope('Secondary', this.id)
        //   .error(
        //     `Secondary channel ${this.id} in ${this.guildId} was deleted from the database.`
        //   );
        await this.delete(true, false);
      }
      this.logger.error(error);
    }
  }

  async lock(): Promise<void> {
    const discordChannel = await this.discord();
    const { everyone } = discordChannel.guild.roles;
    const currentlyActive = [...discordChannel.members.values()];

    const { permissionOverwrites } = discordChannel;

    await Promise.all(
      currentlyActive.map((member) =>
        permissionOverwrites.create(member.id, {
          Connect: true,
        })
      )
    ).then(() => {
      if (everyone) {
        permissionOverwrites.create(everyone.id, { Connect: false });
      }
    });

    await this.db.secondary.update({
      where: { id: this.id },
      data: {
        locked: true,
      },
    });

    await this.update();
  }

  async unlock(): Promise<void> {
    const discordChannel = await this.discord();

    await discordChannel.lockPermissions();

    await this.db.secondary.update({
      where: { id: this.id },
      data: {
        locked: false,
      },
    });

    await this.update();
  }

  async changeOwner(user: User): Promise<void> {
    await this.db.secondary.update({
      where: { id: this.id },
      data: { creator: user.id },
    });
  }

  async discord() {
    try {
      const channel = await this.client.channels.fetch(this.id);
      if (!channel.isVoiceBased()) return null;
      return channel;
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === 10003) {
          await this.delete(false, true);
        }
      }
      return null;
    }
  }

  prisma() {
    return this.db.secondary.findUnique({ where: { id: this.id } });
  }

  private async deleteDiscord() {
    const channel = await this.discord();
    if (channel) {
      return channel.delete();
    }
    return null;
  }

  async delete(deleteDiscord: boolean = true, deletePrisma: boolean = true) {
    try {
      if (deleteDiscord) {
        await this.deleteDiscord();
      }
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === 10003) {
          deleteDiscord = false;
        }
      }

      this.logger
        .scope('Secondary', this.id, 'delete')
        .error('Failed to delete discord secondary channel', error);
    }

    this.logger.scope('Secondary', this.id).debug(`Secondary channel deleted.`);
    const secondaries = Container.get(Secondaries);
    if (deletePrisma) {
      await secondaries.delete(this.id);
    }
    updatePresence();
    if (this.mqtt) {
      this.mqtt.publish(
        'dynamica/secondaries',
        (await secondaries.count).toString()
      );
    }
  }

  toString() {
    return `<Secondary: ${this.id}>`;
  }
}

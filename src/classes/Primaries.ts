import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
// eslint-disable-next-line import/no-cycle
import updatePresence from '@/utils/presence';
import {
  ChannelType,
  DiscordAPIError,
  GuildChannel,
  GuildMember,
  Guild,
} from 'discord.js';
import { Service } from 'typedi';
import MQTT from '../services/MQTT';
// eslint-disable-next-line import/no-cycle
import Primary from './Primary';
// eslint-disable-next-line import/no-cycle
import Secondaries from './Secondaries';

@Service()
export default class Primaries {
  constructor(
    private mqtt: MQTT,
    private client: Client,
    private db: DB,
    private logger: Logger,
    private secondaries: Secondaries
  ) {}

  public async remove(id: string) {
    await this.db.primary.delete({
      where: { id },
    });
    if (this.mqtt) {
      this.mqtt.publish('dynamica/primaries', (await this.count).toString());
    }
  }

  public async get(id: string | undefined) {
    if (!id) {
      return null;
    }
    const dbEntry = await this.db.primary.findUnique({ where: { id } });
    if (!dbEntry) {
      return null;
    }
    return new Primary(
      dbEntry.id,
      dbEntry.guildId,
      this.db,
      this.client,
      this.secondaries,
      this.logger,
      this
    );
  }

  get count() {
    return this.db.primary.count();
  }

  /**
   * Create a new primary channel
   * @param guild The guild
   * @param user The user who ran the command
   * @param section The section that the channel should be assigned to
   */
  async initialise(guild: Guild, member: GuildMember, section?: GuildChannel) {
    const parent = section?.id;

    const channel = await guild.channels.create({
      type: ChannelType.GuildVoice,
      name: '➕ New Session',
      parent,
    });
    const primary = await this.db.primary.create({
      data: {
        id: channel.id,
        creator: member.id,
        guild: {
          connectOrCreate: {
            create: {
              id: guild.id,
            },
            where: {
              id: guild.id,
            },
          },
        },
      },
    });

    this.logger
      .scope('Primary', channel.id)
      .debug(
        `New primary channel ${channel.name} created by ${primary.creator}.`
      );

    const createdChannel = new Primary(
      primary.id,
      primary.guildId,
      this.db,
      this.client,
      this.secondaries,
      this.logger,
      this
    );

    updatePresence();
    return createdChannel;
  }

  public async load() {
    const dbPrimaries = await this.db.primary.findMany();

    const loadResult = await Promise.allSettled(
      dbPrimaries.map(async (channel) => {
        await this.client.channels.fetch(channel.id);
        const primary = new Primary(
          channel.id,
          channel.guildId,
          this.db,
          this.client,
          this.secondaries,
          this.logger,
          this
        );

        return primary;
      })
    );

    loadResult.forEach(async (result, index) => {
      if (result.status === 'rejected') {
        if (result.reason instanceof DiscordAPIError) {
          this.logger.error(
            `Failed to load primary ${dbPrimaries[index].id} (${result.reason.message})`
          );
          if (
            result.reason.code === 10013 ||
            result.reason.code === 10003 ||
            result.reason.code === 50001
          ) {
            await this.db.primary.delete({
              where: { id: dbPrimaries[index].id },
            });
          } else {
            this.logger.error(result.reason);
          }
        }
      } else {
        try {
          await result.value.update();
        } catch (error) {
          this.logger.error(error);
        }
      }
    });

    if (this.mqtt) {
      this.mqtt.publish('dynamica/primaries', (await this.count).toString());
    }
  }

  public async cleanUp() {
    this.logger.debug('Cleaning up primary channels');

    const dbPrimaries = await this.db.primary.findMany();

    const loadResult = await Promise.allSettled(
      dbPrimaries.map(async (channel) => {
        await this.client.channels.fetch(channel.id);
        const primary = new Primary(
          channel.id,
          channel.guildId,
          this.db,
          this.client,
          this.secondaries,
          this.logger,
          this
        );

        return primary;
      })
    );

    loadResult.forEach(async (result, index) => {
      if (result.status === 'rejected') {
        if (result.reason instanceof DiscordAPIError) {
          this.logger.error(
            `Failed to load primary ${dbPrimaries[index].id} (${result.reason.message})`
          );
          if (
            result.reason.code === 10013 ||
            result.reason.code === 10003 ||
            result.reason.code === 50001
          ) {
            await this.db.primary.delete({
              where: { id: dbPrimaries[index].id },
            });
          } else {
            this.logger.error(result.reason);
          }
        }
      }
    });

    if (this.mqtt) {
      this.mqtt.publish('dynamica/primaries', (await this.count).toString());
    }
    this.logger.debug('Primary channel cleanup complete');
  }
}

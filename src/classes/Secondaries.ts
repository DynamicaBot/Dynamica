import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
import channelActivities from '@/utils/activity';
import formatChannelName from '@/utils/format';
import {
  ChannelType,
  DiscordAPIError,
  GuildMember,
  VoiceBasedChannel,
} from 'discord.js';
import { Service } from 'typedi';
import emojiList from 'emoji-random-list';
import MQTT from '../services/MQTT';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import Secondary from './Secondary';

@Service()
export default class Secondaries {
  constructor(
    private mqtt: MQTT,
    private db: DB,
    private logger: Logger,
    private client: Client
  ) {}

  public async delete(id: string) {
    try {
      return await this.db.secondary.delete({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  public async get(id: string | undefined) {
    if (!id) {
      return null;
    }
    const dbEntry = await this.db.secondary.findUnique({ where: { id } });
    if (!dbEntry) {
      return null;
    }
    return new Secondary(
      dbEntry.id,
      dbEntry.guildId,
      dbEntry.primaryId,
      this.db,
      this.client,
      this.logger,
      this.mqtt
    );
  }

  public get count() {
    return this.db.secondary.count();
  }

  async load() {
    const dbSecondaries = await this.db.secondary.findMany();

    const loadResult = await Promise.allSettled(
      dbSecondaries.map(async (channel) => {
        await this.client.channels.fetch(channel.id);
        const secondary = new Secondary(
          channel.id,
          channel.guildId,
          channel.primaryId,
          this.db,
          this.client,
          this.logger,
          this.mqtt
        );

        return secondary;
      })
    );

    loadResult.forEach(async (result, index) => {
      if (result.status === 'rejected') {
        if (result.reason instanceof DiscordAPIError) {
          this.logger
            .scope('Secondary', dbSecondaries[index].id)
            .error(
              `Failed to load secondary ${dbSecondaries[index].id} (${result.reason.message})`
            );
          if (result.reason.code === 10013 || result.reason.code === 10003) {
            await this.delete(dbSecondaries[index].id);
          } else {
            this.logger
              .scope('Secondary', dbSecondaries[index].id)
              .error(result.reason);
          }
        }
      } else {
        try {
          await result.value.update();
        } catch (error) {
          this.logger.scope('Secondary', dbSecondaries[index].id).error(error);
        }
      }
    });

    if (this.mqtt) {
      this.mqtt.publish('dynamica/secondaries', (await this.count).toString());
    }
  }

  public async initalise(primary: VoiceBasedChannel, member: GuildMember) {
    const { guild } = member;
    const aliases = await this.db.alias.findMany({
      where: { guildId: guild.id },
    });

    const activities = channelActivities(primary);

    const primaryPrisma = await this.db.primary.findUnique({
      where: { id: primary.id },
    });

    const str = !activities.length
      ? primaryPrisma.generalName
      : primaryPrisma.template;

    const adjacentSecondaryCount = await this.db.secondary.count({
      where: {
        primaryId: primary.id,
        guildId: primary.guildId,
      },
    });

    const emoji = emojiList.random({
      skintones: false,
      genders: false,
      group: 'smileys-and-emotion,animals-and-nature,food-and-drink',
    })[0]; // random() returns an array of emojis

    const secondary = await member.guild.channels.create({
      type: ChannelType.GuildVoice,
      name: formatChannelName(str, {
        creator: member?.displayName as string,
        channelNumber: adjacentSecondaryCount + 1,
        activities,
        aliases,
        memberCount: primary.members.size,
        emoji,
        locked: false,
      }),
      parent: primary.parent ?? undefined,
      position: primary.position ? primary.position + 1 : undefined,
      bitrate: primary.bitrate ?? undefined,
    });

    if (secondary.parent && primary.permissionsLocked) {
      secondary.lockPermissions();
    }

    await member.voice.setChannel(secondary);

    await this.db.secondary.create({
      data: {
        id: secondary.id,
        creator: member.id,
        primaryId: primary.id,
        guildId: guild.id,
        emoji,
      },
    });

    this.logger
      .scope('Secondary', secondary.id)
      .debug(
        `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${member.guild.name}.`
      );

    const dynamicaSecondary = new Secondary(
      secondary.id,
      guild.id,
      primary.id,
      this.db,
      this.client,
      this.logger,
      this.mqtt
    );
    if (this.mqtt) {
      this.mqtt.publish('dynamica/secondaries', (await this.count).toString());
    }
    // secondaryFactory.create(
    //   secondary.id,
    //   guild.id,
    //   primary.id
    // );
    return dynamicaSecondary;
  }

  public async cleanUp() {
    this.logger.debug('Cleaning up secondary channels...');
    const dbSecondaries = await this.db.secondary.findMany();

    const loadResult = await Promise.allSettled(
      dbSecondaries.map(async (channel) => {
        await this.client.channels.fetch(channel.id);
        const secondary = new Secondary(
          channel.id,
          channel.guildId,
          channel.primaryId,
          this.db,
          this.client,
          this.logger,
          this.mqtt
        );

        return secondary;
      })
    );

    loadResult.forEach(async (result, index) => {
      if (result.status === 'rejected') {
        if (result.reason instanceof DiscordAPIError) {
          this.logger
            .scope('Secondary', dbSecondaries[index].id)
            .error(
              `Failed to load secondary ${dbSecondaries[index].id} (${result.reason.message})`
            );
          if (result.reason.code === 10013 || result.reason.code === 10003) {
            await this.delete(dbSecondaries[index].id);
          } else {
            this.logger
              .scope('Secondary', dbSecondaries[index].id)
              .error(result.reason);
          }
        }
      } else {
        try {
          await result.value.update();
        } catch (error) {
          this.logger.scope('Secondary', dbSecondaries[index].id).error(error);
        }
      }
    });

    if (this.mqtt) {
      this.mqtt.publish('dynamica/secondaries', (await this.count).toString());
    }
    this.logger.debug('Secondary channel cleanup complete.');
  }
}

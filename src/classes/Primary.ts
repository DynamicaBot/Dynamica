import db from '@db';
import signaleLogger from '@utils/logger';
import {
  ChannelType,
  Client,
  DiscordAPIError,
  Guild,
  GuildChannel,
  GuildMember,
} from 'discord.js';
import { Signale } from 'signale';
import MQTT from './MQTT';
// eslint-disable-next-line import/no-cycle
import DynamicaSecondary from './Secondary';

export default class DynamicaPrimary {
  id: string;

  guildId: string;

  static channels: DynamicaPrimary[] = [];

  private static readonly logger = signaleLogger.scope('Primary');

  private readonly logger: Signale;

  public static add(channel: DynamicaPrimary) {
    this.channels.push(channel);
  }

  public static remove(id: string) {
    this.channels = this.channels.filter((channel) => channel.id !== id);
  }

  public static get(id: string | undefined) {
    return this.channels.find((channel) => channel.id === id);
  }

  static get count() {
    return this.channels.length;
  }

  public static has = (id: string) =>
    this.channels.some((channel) => channel.id === id);

  constructor(channelId: string, guildId: string) {
    this.id = channelId;
    this.guildId = guildId;
    this.logger = signaleLogger.scope('Primary', this.id);
    DynamicaPrimary.add(this);
  }

  /**
   * Create a new primary channel
   * @param guild The guild
   * @param user The user who ran the command
   * @param section The section that the channel should be assigned to
   */
  static async initialise(
    guild: Guild,
    member: GuildMember,
    section?: GuildChannel
  ) {
    const parent = section?.id;

    const channel = await guild.channels.create({
      type: ChannelType.GuildVoice,
      name: '➕ New Session',
      parent,
    });
    const primary = await db.primary.create({
      data: {
        id: channel.id,
        creator: member.id,
        guildId: guild.id,
      },
    });

    this.logger
      .scope('Primary', channel.id)
      .debug(
        `New primary channel ${channel.name} created by ${primary.creator}.`
      );

    const mqtt = MQTT.getInstance();

    mqtt?.publish('dynamica/primary/create', {
      id: primary.id,
      createdAt: new Date().toISOString(),
    });

    const createdChannel = new DynamicaPrimary(channel.id, guild.id);

    return createdChannel;
  }

  /**
   * Delete a primary discord channel. DB & Discord Channel.
   */
  async delete(client: Client<true>): Promise<void> {
    const channel = await this.discord(client);
    if (channel) {
      try {
        await channel.delete();
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          if (error.code === 10003) {
            this.logger.debug(
              `Primary channel ${channel.name} (${channel.id}) was already deleted.`
            );
            this.deletePrisma();
            DynamicaPrimary.remove(this.id);
          } else {
            this.logger.error(error);
          }
        } else {
          this.logger.error(error);
        }
      } finally {
        const mqtt = MQTT.getInstance();
        mqtt?.publish(`dynamica/primary/delete`, {
          id: this.id,
        });
      }
    }
  }

  async deletePrisma() {
    await db.primary.delete({ where: { id: this.id } });
  }

  prisma() {
    return db.primary.findUniqueOrThrow({
      where: { id: this.id },
      include: { secondaries: true },
    });
  }

  async deleteDiscord(client: Client<true>) {
    const channel = await this.discord(client);
    await channel.delete();
  }

  async discord(client: Client<true>) {
    const guild = await client.guilds.fetch(this.guildId);
    const channel = await guild.channels.fetch(this.id);
    if (!channel.isVoiceBased()) {
      throw new Error('Not a voice channel');
    }
    return channel;
  }

  async update(client: Client<true>) {
    const { members } = await this.discord(client);
    if (members.size) {
      const primaryMember = members.at(0);
      const secondary = await DynamicaSecondary.initalise(this, primaryMember);
      const others = [...members.values()].slice(1);
      await Promise.all(
        others.map(async (member) => {
          await secondary.addMember(member);
        })
      );
    }
    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/primary/update`, {
      id: this.id,
    });
  }

  toString() {
    return `<Primary: ${this.id}>`;
  }
}

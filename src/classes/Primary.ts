import db from '@db';
import logger from '@utils/logger';
import {
  ChannelType,
  Client,
  DiscordAPIError,
  Guild,
  GuildChannel,
  User,
} from 'discord.js';
import {
  DynamicaChannel,
  DynamicaChannelType,
} from './DynamicaChannel.interface';
import { MQTT } from './MQTT';
import DynamicaSecondary from './Secondary';

export default class DynamicaPrimary
  implements DynamicaChannel<DynamicaChannelType.Primary>
{
  id: string;
  guildId: string;
  static channels: DynamicaPrimary[] = [];

  type: DynamicaChannelType.Primary;

  public static add(channel: DynamicaPrimary) {
    this.channels.push(channel);
  }

  public static remove(id: string) {
    this.channels = this.channels.filter((channel) => channel.id !== id);
  }

  public static get(id: string | undefined) {
    return this.channels.find((channel) => channel.id === id);
  }

  public static has = (id: string) =>
    this.channels.some((channel) => channel.id === id);

  constructor(channelId: string, guildId: string) {
    this.id = channelId;
    this.guildId = guildId;
    this.type = DynamicaChannelType.Primary;
    DynamicaPrimary.add(this);
  }

  /**
   * Create a new primary channel
   * @param guild The guild
   * @param user The user who ran the command
   * @param section The section that the channel should be assigned to
   */
  static async initialise(guild: Guild, user: User, section?: GuildChannel) {
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

      const mqtt = MQTT.getInstance();

      mqtt?.publish('dynamica/primary/create', {
        id: primary.id,
        name: channel.name,
        guild: {
          id: guild.id,
          name: guild.name,
        },
        creator: {
          id: user.id,
          tag: user.tag,
        },
        createdAt: new Date().toISOString(),
      });

      const createdChannel = new DynamicaPrimary(channel.id, guild.id);

      return createdChannel;
    } catch (error) {
      logger.error('Error creating new primary channel:', error);
    }
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
            logger.debug(
              `Primary channel ${channel.name} (${channel.id}) was already deleted.`
            );
            this.deletePrisma();
            DynamicaPrimary.remove(this.id);
          } else {
            logger.error(error);
          }
        } else {
          logger.error(error);
        }
      } finally {
        const mqtt = MQTT.getInstance();
        mqtt?.publish(`dynamica/primary/delete`, {
          type: DynamicaChannelType.Primary,
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

  async update(client: Client<true>, guild: Guild) {
    const { members } = await this.discord(client);
    if (members.size) {
      const primaryMember = members.at(0);
      const secondary = await DynamicaSecondary.initalise(
        client,
        this,
        guild,
        primaryMember
      );
      const others = [...members.values()].slice(1);
      await Promise.all(
        others.map(async (member) => {
          await secondary.addMember(member);
        })
      );
    }
    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/primary/update`, {
      type: DynamicaChannelType.Primary,
      id: this.id,
    });
  }

  toString() {
    return `<Primary: ${this.id}>`;
  }
}

import DB from '@/services/DB';
import Logger from '@/services/Logger';
import {
  ChannelType,
  Client,
  DiscordAPIError,
  Guild,
  GuildChannel,
  GuildMember,
} from 'discord.js';
import { Signale } from 'signale';
import { Container, Service } from 'typedi';
import Primaries from './Primaries';
// eslint-disable-next-line import/no-cycle
import PrimaryFactory from './PrimaryFactory';
import DynamicaSecondary from './Secondary';

@Service({ factory: [PrimaryFactory, 'create'] })
export default class DynamicaPrimary {
  public id: string;

  public guildId: string;

  private readonly logger: Signale;

  constructor(channelId: string, guildId: string, private db: DB) {
    this.id = channelId;
    this.guildId = guildId;
    this.logger = Container.get(Logger);
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
    const logger = Container.get(Logger);
    const db = Container.get(DB);
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

    logger
      .scope('Primary', channel.id)
      .debug(
        `New primary channel ${channel.name} created by ${primary.creator}.`
      );

    const primaryFactory = Container.get(PrimaryFactory);
    const createdChannel = primaryFactory.create(channel.id, guild.id);
    const primaries = Container.get(Primaries);
    primaries.add(createdChannel);
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
            const primaries = Container.get(Primaries);
            primaries.remove(this.id);
          } else {
            this.logger.error('Unknown discord error: ', error);
          }
        } else {
          this.logger.error('Unknown errror', error);
        }
      }
    }
  }

  async deletePrisma() {
    await this.db.primary.delete({ where: { id: this.id } });
  }

  prisma() {
    return this.db.primary.findUniqueOrThrow({
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
    const channel = await this.discord(client);
    const { members } = channel;
    if (members.size) {
      const primaryMember = members.at(0);
      const secondary = await DynamicaSecondary.initalise(
        channel,
        primaryMember
      );
      const others = [...members.values()].slice(1);
      await Promise.all(
        others.map(async (member) => {
          await secondary.addMember(member);
        })
      );
    }
  }

  toString() {
    return `<Primary: ${this.id}>`;
  }
}

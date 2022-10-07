import DynamicaPrimary from '@classes/Primary';
import db from '@db';
import Prisma from '@prisma/client';
import updateActivityCount from '@utils';
import formatChannelName from '@utils/format';
import logger from '@utils/logger';
import {
  ActivityType,
  ChannelType,
  Client,
  DiscordAPIError,
  Guild,
  GuildMember,
  User,
} from 'discord.js';
import {
  DynamicaChannel,
  DynamicaChannelType,
} from './DynamicaChannel.interface';
import { MQTT } from './MQTT';

export default class DynamicaSecondary
  implements DynamicaChannel<DynamicaChannelType.Secondary>
{
  static channels: DynamicaSecondary[] = [];

  id: string;

  type: DynamicaChannelType.Secondary;

  guildId: string;

  /** The prisma primary */
  parentId: string;

  constructor(channelId: string, guildId: string, primaryId: string) {
    this.guildId = guildId;
    this.id = channelId;
    this.type = DynamicaChannelType.Secondary;
    this.parentId = primaryId;
    DynamicaSecondary.add(this);
  }

  public static add(channel: DynamicaSecondary) {
    this.channels.push(channel);
  }

  public static remove(id: string) {
    this.channels = this.channels.filter((channel) => channel.id !== id);
  }

  public static get(id: string | undefined) {
    return this.channels.find((channel) => channel.id === id);
  }

  /**
   * Get the secondary channels from a primary id.
   * @param id The id of the parent channel.
   * @returns array of secondary channels.
   */
  public static getFromPrimaryId(id: string) {
    return this.channels.filter((channel) => channel.parentId === id);
  }

  public static has = (id: string) =>
    this.channels.some((channel) => channel.id === id);

  /**
   * Create a secondary channel.
   * @param primary primary parent channel
   * @param guild discord guild
   * @param member guild member who created the channel
   * @returns
   */
  public static async initalise(
    client: Client<true>,
    primary: DynamicaPrimary,
    guild: Guild,
    member: GuildMember
  ) {
    const aliases = await db.alias.findMany({
      where: { guildId: guild.id },
    });

    const primaryDiscordChannel = await primary.discord(client);
    console.log({
      primaryDiscordChannel: primaryDiscordChannel.members.map(
        (member) => member.presence
      ),
    });
    const activities = primaryDiscordChannel.members
      .filter((member) => member.presence.activities.length > 0)
      .filter((member) => !member.user.bot)
      .map((member) => member.presence.activities)
      .flat()
      .filter((activity) => activity.type !== ActivityType.Custom)
      .filter((activity) => activity.type !== ActivityType.Listening)
      .map((activity) => activity.name);

    const primaryPrisma = await primary.prisma();

    const str = !activities.length
      ? primaryPrisma.generalName
      : primaryPrisma.template;

    const adjacentSecondaryCount = await db.secondary.count({
      where: {
        primaryId: primary.id,
        guildId: primary.guildId,
      },
    });

    const secondary = await guild.channels.create({
      type: ChannelType.GuildVoice,
      name: formatChannelName(str, {
        creator: member?.displayName as string,
        channelNumber: adjacentSecondaryCount + 1,
        activities,
        aliases,
        memberCount: primaryDiscordChannel.members.size,
        locked: false,
      }),
      parent: primaryDiscordChannel.parent ?? undefined,
      position: primaryDiscordChannel.position
        ? primaryDiscordChannel.position + 1
        : undefined,
      bitrate: primaryDiscordChannel.bitrate ?? undefined,
    });

    if (secondary.parent && primaryDiscordChannel.permissionsLocked) {
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
      .then(() => {
        updateActivityCount(client);
      });

    logger.debug(
      `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${guild.name}.`
    );

    const mqtt = MQTT.getInstance();

    mqtt?.publish('dynamica/secondary/create', {
      id: secondary.id,
      name: secondary.name,
      primaryId: primary.id,
      createdAt: new Date().toISOString(),
    });

    const dynamicaSecondary = new DynamicaSecondary(
      secondary.id,
      guild.id,
      primary.id
    );
    return dynamicaSecondary;
  }

  async addMember(member: GuildMember): Promise<void> {
    const channel = await this.discord(member.client);
    await member.voice.setChannel(channel);
  }

  /**
   * Update secondary channel, changing name if required.
   */
  async update(client: Client<true>) {
    const discordChannel = await this.discord(client);
    if (discordChannel.members.size === 0) {
      this.delete(client);
    }
    const prismaChannel = (await this.prisma()) as Prisma.Secondary & {
      guild: Prisma.Guild;
    };

    const primary = DynamicaPrimary.get(this.parentId);
    const primaryPrisma = await primary.prisma();

    const adjacentSecondaryCount = await db.secondary.count({
      where: {
        primaryId: discordChannel.parentId,
        guildId: discordChannel.guildId,
      },
    });

    /**
     * Return aliases
     */
    const aliases = await db.alias.findMany({
      where: {
        guildId: discordChannel.guildId,
      },
    });

    /**
     * The activities list minus stuff that should be ignored like Spotify and Custom status // Todo: more complicated logic for people who might be streaming
     */
    const activities = discordChannel.members
      .filter((member) => member.presence.activities.length > 0)
      .filter((member) => !member.user.bot)
      .map((member) => member.presence.activities)
      .flat()
      .filter((activity) => activity.type !== ActivityType.Custom)
      .filter((activity) => activity.type !== ActivityType.Listening)
      .map((activity) => activity.name);

    const { locked } = prismaChannel;

    /**
     * The template to be used.
     */
    const str =
      prismaChannel.name ??
      (!activities.length ? primaryPrisma.generalName : primaryPrisma.template);

    const guild = await client.guilds.fetch(prismaChannel.guildId);

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
      locked,
    });

    if (this.discord.name !== name) {
      if (!discordChannel.manageable) {
        throw new Error('Channel not manageable');
      }
      discordChannel
        .edit({
          name,
        })
        .then(() => {
          logger.debug(
            `Secondary channel ${this.discord.name} in ${discordChannel.guild.name} name changed.`
          );
        });
    }

    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/secondary/update`, {
      id: this.id,
      primaryId: primary.id,
      name,
      locked,
      activities,
      memberCount: discordChannel.members.size,
    });

    return this;
  }

  async lock(client: Client<true>): Promise<void> {
    const discordChannel = await this.discord(client);
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

    await db.secondary.update({
      where: { id: this.id },
      data: {
        locked: true,
      },
    });

    await this.update(client);
  }

  async unlock(client: Client<true>): Promise<void> {
    const discordChannel = await this.discord(client);

    await discordChannel.lockPermissions();

    await db.secondary.update({
      where: { id: this.id },
      data: {
        locked: false,
      },
    });

    await this.update(client);
  }

  async changeOwner(user: User): Promise<void> {
    await db.secondary.update({
      where: { id: this.id },
      data: { creator: user.id },
    });
  }

  async discord(client: Client<true>) {
    const guild = await client.guilds.fetch(this.guildId);
    const channel = await guild.channels.fetch(this.id);
    if (!channel.isVoiceBased()) {
      throw new Error('Not voice based');
    }
    return channel;
  }

  prisma() {
    return db.secondary.findUniqueOrThrow({ where: { id: this.id } });
  }

  async deleteDiscord(client: Client<true>) {
    const channel = await this.discord(client);
    channel.delete();
  }
  async deletePrisma() {
    await db.secondary.delete({ where: { id: this.id } });
  }
  async delete(client: Client<true>) {
    const channel = await this.discord(client);
    if (channel) {
      try {
        await channel.delete();
        await this.deletePrisma();
        DynamicaSecondary.remove(this.id);
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          if (error.code === 10003) {
            logger.debug(
              `Primary channel ${channel.name} (${channel.id}) was already deleted.`
            );
            await this.deletePrisma();
            DynamicaSecondary.remove(this.id);
          } else {
            logger.error(error);
          }
        } else {
          logger.error(error);
        }
      } finally {
        const mqtt = MQTT.getInstance();
        mqtt?.publish(`dynamica/secondary/delete`, {
          id: this.id,
        });
      }
    }
  }

  toString() {
    return `<Secondary: ${this.id}>`;
  }
}

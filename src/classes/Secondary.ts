// eslint-disable-next-line import/no-cycle
import channelActivities from '@/utils/activity';
import updatePresence from '@/utils/presence';
import db from '@db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import formatChannelName from '@utils/format';
import signaleLogger from '@utils/logger';
import {
  ChannelType,
  Client,
  DiscordAPIError,
  GuildMember,
  User,
  VoiceBasedChannel,
} from 'discord.js';
import { Signale } from 'signale';
import Secondaries from './Secondaries';
// eslint-disable-next-line import/no-cycle

export default class DynamicaSecondary {
  id: string;

  guildId: string;

  /** The prisma primary */
  parentId: string;

  private static readonly logger = signaleLogger.scope('Secondary');

  private readonly logger: Signale;

  constructor(channelId: string, guildId: string, primaryId: string) {
    this.guildId = guildId;
    this.id = channelId;
    this.parentId = primaryId;
    this.logger = signaleLogger.scope('Secondary', this.id);
  }

  /**
   * Create a secondary channel.
   * @param primary primary parent channel
   * @param guild discord guild
   * @param member guild member who created the channel
   * @returns
   */
  public static async initalise(
    primary: VoiceBasedChannel,
    member: GuildMember
  ) {
    const { guild } = member;
    const aliases = await db.alias.findMany({
      where: { guildId: guild.id },
    });

    const activities = channelActivities(primary);

    const primaryPrisma = await db.primary.findUnique({
      where: { id: primary.id },
    });

    const str = !activities.length
      ? primaryPrisma.generalName
      : primaryPrisma.template;

    const adjacentSecondaryCount = await db.secondary.count({
      where: {
        primaryId: primary.id,
        guildId: primary.guildId,
      },
    });

    const secondary = await member.guild.channels.create({
      type: ChannelType.GuildVoice,
      name: formatChannelName(str, {
        creator: member?.displayName as string,
        channelNumber: adjacentSecondaryCount + 1,
        activities,
        aliases,
        memberCount: primary.members.size,
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

    await db.secondary.create({
      data: {
        id: secondary.id,
        creator: member.id,
        primaryId: primary.id,
        guildId: guild.id,
      },
    });

    this.logger
      .scope('Secondary', secondary.id)
      .debug(
        `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${member.guild.name}.`
      );

    const dynamicaSecondary = new DynamicaSecondary(
      secondary.id,
      guild.id,
      primary.id
    );
    Secondaries.add(dynamicaSecondary);
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
    const prismaChannel = await this.prisma();

    const primaryPrisma = await db.primary.findUnique({
      where: { id: this.parentId },
    });

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
    const activities = channelActivities(discordChannel);

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

    if (discordChannel.name !== name) {
      if (!discordChannel.manageable) {
        throw new Error('Channel not manageable');
      }
      await discordChannel.edit({
        name,
      });
      this.logger.debug(
        `Secondary channel ${this.discord.name} in ${discordChannel.guild.name} name changed.`
      );
    }

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
    const channel = await client.channels.fetch(this.id);
    if (!channel.isVoiceBased()) {
      throw new Error('Not voice based');
    }
    return channel;
  }

  prisma() {
    return db.secondary.findUniqueOrThrow({ where: { id: this.id } });
  }

  async deleteDiscord(client: Client<true>) {
    try {
      const channel = await this.discord(client);
      await channel.delete();
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === 50013) {
          this.logger.warn(`Secondary channel not manageable.`);
        } else if (error.code === 50001) {
          this.logger.warn(`Secondary channel not viewable.`);
        } else if (error.code === 50035) {
          this.logger.warn(`Secondary channel not editable.`);
        } else if (error.code === 50034) {
          this.logger.warn(`Secondary channel not deletable.`);
        } else if (error.code === 10003) {
          this.logger.warn(`Secondary channel not found.`);
        } else {
          this.logger.error(error);
        }
      }
    }
  }

  async deletePrisma() {
    try {
      await db.secondary.delete({ where: { id: this.id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // this.logger.error(error);
          this.logger.warn(`Secondary channel not found.`);
        } else {
          this.logger.error(error.message);
        }
      }
    }
  }

  async delete(client: Client<true>) {
    await this.deleteDiscord(client);

    await this.deletePrisma();

    this.logger.debug(`Secondary channel deleted.`);

    Secondaries.remove(this.id);
    updatePresence(client);
  }

  toString() {
    return `<Secondary: ${this.id}>`;
  }
}

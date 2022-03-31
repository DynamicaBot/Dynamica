import { Embed } from "@discordjs/builders";
import Prisma from "@prisma/client";
import {
  Client,
  Guild,
  GuildMember,
  TextChannel,
  User,
  VoiceChannel,
} from "discord.js";
import { db } from "../utils/db";
import { formatChannelName } from "../utils/format";
import { logger } from "../utils/logger";
import { updateActivityCount } from "../utils/operations/general";
import PrimaryClass from "./primary";

export default class DynamicaSecondary {
  /** The secondary channel as defined by prisma */
  prisma: Prisma.Secondary;
  /** The discord channel as defined by discord */
  discord: VoiceChannel;
  /** The discordjs client instance */
  client: Client<true>;
  /** The channel id as set in fetch */
  id: string;
  /** The discord text channel */
  textChannel?: TextChannel;
  /** The prisma guild */
  prismaGuild: Prisma.Guild;
  /** The prisma primary */
  prismaPrimary: Prisma.Primary;

  /**
   * The secondary constructor
   * @param client DiscordJS client instance
   * @param id The channel Id
   */
  constructor(client: Client<true>, id?: string) {
    this.client = client;
    if (id) {
      this.id = id;
    }
  }

  /**
   * Create a secondary channel.
   * @param primary primary parent channel
   * @param guild discord guild
   * @param member guild member who created the channel
   * @returns
   */
  async create(
    primary: PrimaryClass,
    guild: Guild,
    member: GuildMember
  ): Promise<DynamicaSecondary> {
    try {
      await primary.fetch();

      const primaryConfig = primary.prisma;

      const aliases = await db.alias.findMany({
        where: { guildId: guild.id },
      });

      const activities = Array.from(
        primary.discord.members.filter((member) => !member.user.bot)
      ).flatMap((entry) => {
        if (!entry[1].presence) return [];
        return entry[1].presence?.activities.map((activity) => activity.name);
      });

      const filteredActivityList = activities
        .filter((activity) => activity !== "Spotify")
        .filter((activity) => activity !== "Custom Status");

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
          type: "GUILD_VOICE",
          parent: primary.discord.parent ?? undefined,
          position: primary.discord.position
            ? primary.discord.position + 1
            : undefined,
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
          const guild = await db.guild.findUnique({ where: { id: this.id } });
          if (guild?.textChannelsEnabled) {
            this.createTextChannel(member);
          }
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
   * Create a text channel.
   * @param member The person who created the channel
   */
  async createTextChannel(member: GuildMember) {
    if (!this.id) {
      throw new Error("No Id defined");
    }
    try {
      const textChannel = await this.discord.guild.channels.create(
        "Text Channel",
        {
          type: "GUILD_TEXT",
          topic: `Private text channel for members of <#${this.id}>.`,
          permissionOverwrites: [
            {
              id: this.discord.guild.channels.guild.roles.everyone,
              deny: "VIEW_CHANNEL",
            },
            { id: member.id, allow: "VIEW_CHANNEL" },
          ],
          parent: this.discord.parent ?? undefined,
        }
      );
      await textChannel.send({
        embeds: [
          new Embed()
            .setTitle("Welcome!")
            .setColor(3447003)
            .setDescription(
              `Welcome to your very own private text chat. This channel is only to people in <#${this.id}>.`
            )
            .setAuthor({
              name: "Dynamica",
              url: "https://dynamica.dev",
              iconURL: "https://dynamica.dev/img/dynamica.png",
            }),
        ],
      });
      this.textChannel = textChannel;
      await db.secondary.update({
        where: { id: this.id },
        data: {
          textChannelId: textChannel.id,
        },
      });
    } catch (error) {
      logger.error("Failed to create text channel:", error);
    }
  }

  /**
   * Fetch the database entry and discord channels (voice and text).
   * @param channelId The discord channel Id.
   */
  async fetch(): Promise<DynamicaSecondary | undefined> {
    // Variables
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.id) {
      throw new Error("No Id defined");
    }

    const { id } = this;

    const prisma = await db.secondary.findUnique({
      where: { id },
      include: { guild: true, primary: true },
    });

    if (prisma) {
      const discord = await this.client.channels.cache.get(id);
      if (discord?.type === "GUILD_VOICE") {
        this.discord = discord;
      } else {
        await db.secondary.delete({ where: { id: prisma.id } });
        return undefined;
      }
      const textChannel = await this.client.channels.cache.get(
        prisma.textChannelId
      );
      this.prisma = prisma;
      this.prismaGuild = prisma.guild;
      this.prismaPrimary = prisma.primary;
      if (textChannel?.type === "GUILD_TEXT") {
        this.textChannel = textChannel;
      } else {
        this.textChannel = undefined;
        await db.secondary.update({
          where: { id },
          data: {
            textChannelId: undefined,
          },
        });
      }
    } else {
      return undefined;
    }

    return this;
  }

  /**
   * Update secondary channel, changing name if required.
   */
  async update(): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined");
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
         * The discord channel to be refreshed
         */

        /**
         * The name of the creator based on the config
         */
        const channelCreator = secondary.creator
          ? this.discord.members.get(secondary.creator)?.displayName
          : undefined;

        /**
         * The creator or, alternatively the person who will become the creator.
         */
        const creator = channelCreator
          ? channelCreator
          : this.discord.members.at(0)?.displayName;

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
          .filter((activity) => activity !== "Spotify")
          .filter((activity) => activity !== "Custom Status");
        const { locked } = secondary;

        /**
         * The template to be used.
         */
        const str = !!secondary.name
          ? secondary.name
          : !filteredActivityList.length
          ? this.prismaPrimary.generalName
          : this.prismaPrimary.template;
        const channelNumber =
          secondaries
            .map((secondaryChannel) => secondaryChannel.id)
            .indexOf(secondary.id) + 1;

        /**
         * The formatted name
         */
        const name = formatChannelName(str, {
          creator: creator ? creator : "",
          aliases: aliases,
          channelNumber: channelNumber,
          activities: filteredActivityList,
          memberCount: this.discord.members.size, // Get this
          locked,
        });

        if (this.discord.name !== name) {
          if (!this.discord.manageable) {
            throw new Error(`Channel not manageable`);
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
    await this.fetch();
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.id) {
      logger.debug("No id");
    }
    try {
      if (!this.discord && !this.prisma) {
        return;
      } else if (!this.discord && !!this.prisma) {
        await this.deletePrisma();
      } else if (!this.prisma && !!this.discord) {
        await this.deleteDiscord();
      } else if (this.discord && this.prisma) {
        await this.deletePrisma();
        await this.deleteDiscord();
      }
      logger.debug(`Secondary channel deleted ${this.id}.`);
    } catch (error) {
      logger.error(error);
    }

    await updateActivityCount(this.client);
  }

  private async deletePrisma(): Promise<void> {
    if (!this.id) {
      throw new Error("No id defined.");
    }
    await db.secondary.delete({ where: { id: this.id } });
  }

  private async deleteDiscord(): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined.");
    }
    if (!this.id) {
      throw new Error("No Id defined.");
    }
    try {
      if (!this.discord.deletable) {
        throw new Error("The channel is not deletable.");
      }

      await updateActivityCount(this.client);

      await this.discord.delete();

      if (this.textChannel) {
        const textChannel = this.discord.guild.channels.cache.get(
          this.prisma.textChannelId
        );
        await textChannel.delete();
      }
    } catch (error) {
      logger.error("Failed to delete secondary:", error);
    }
  }

  async lock(): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.discord || !this.prisma) {
      throw new Error("Please fetch");
    }
    try {
      const everyone = this.discord.guild.roles.everyone;
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
      logger.error("Failed to lock channel:", error);
    }
  }

  async unlock(): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.discord || !this.prisma) {
      throw new Error("Please fetch");
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
      logger.error("Failed to unlock channel:", error);
    }
  }

  async changeOwner(user: User): Promise<void> {
    if (!this.client) {
      throw new Error("No client defined");
    }
    if (!this.discord || !this.prisma) {
      throw new Error("Please fetch");
    }
    try {
      await db.secondary.update({
        where: { id: this.id },
        data: { creator: user.id },
      });
    } catch (error) {
      logger.error("Failed to set owner of channel:", error);
    }
    this.fetch();
  }
}

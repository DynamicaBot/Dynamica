import { Embed } from "@discordjs/builders";
import { Secondary } from "@prisma/client";
import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
  VoiceBasedChannel,
} from "discord.js";
import { db } from "../db";
import { formatChannelName } from "../formatString";
import { getChannel } from "../getCached";
import { logger } from "../logger";
import { updateActivityCount } from "./general";

/**
 * Deletes Secondary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 */
export const deleteDiscordSecondary = async (
  channel: BaseGuildVoiceChannel,
  config: Secondary
) => {
  const { id } = channel;
  if (channel?.members.size !== 0 || !channel?.deletable || !config) return;

  const textChannel = channel.guild.channels.cache.get(config.textChannelId);

  try {
    db.secondary.delete({ where: { id } });
  } catch (e) {
    logger.error("Secondary db entry does not exist:", e);
  }
  try {
    channel?.delete();
  } catch (e) {
    logger.error("Secondary discord channel does not exist:", e);
  }

  if (textChannel) {
    try {
      textChannel.delete();
    } catch (e) {
      logger.error("Secondary text channel does not exist:", e);
    }
  }

  updateActivityCount(channel.client);
  logger.debug(`Secondary channel deleted ${id}.`);
};

/**
 * Creates a secondary channel linked to a primary.
 * @param channelManager Discord's Channel Manager.
 * @param primaryId ID of the primary channel to link to.
 * @param member The user (if they're specified) to be moved to the new channel.
 */
export const createSecondary = async (
  channelManager: GuildChannelManager,
  primaryId: string,
  member?: GuildMember
) => {
  const primaryConfig = await db.primary.findUnique({
    where: { id: primaryId },
    include: { guild: true, secondaries: true },
  });

  if (!primaryConfig) return;

  const aliases = await db.alias.findMany({
    where: { guildId: channelManager.guild.id },
  });

  const primaryChannel = await getChannel(channelManager, primaryId);

  if (!primaryConfig || !primaryChannel?.isVoice()) return;

  const activities = Array.from(primaryChannel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });

  const filteredActivityList = activities
    .filter((activity) => activity !== "Spotify")
    .filter((activity) => activity !== "Custom Status");

  const str = !filteredActivityList.length
    ? primaryConfig.generalName
    : primaryConfig.template;

  const secondary = await channelManager.create(
    formatChannelName(str, {
      creator: member?.displayName as string,
      channelNumber: primaryConfig.secondaries.length + 1,
      activities: filteredActivityList,
      aliases,
      memberCount: primaryChannel.members.size,
      locked: false,
    }),
    {
      type: "GUILD_VOICE",
      parent: primaryChannel?.parent ?? undefined,
      position: primaryChannel?.position
        ? primaryChannel.position + 1
        : undefined,
    }
  );

  if (secondary.parent && primaryChannel.permissionsLocked) {
    secondary.lockPermissions();
  }

  if (member) {
    member.voice.setChannel(secondary);
  }
  const textChannelId = async () => {
    if (primaryConfig.guild?.textChannelsEnabled && member) {
      const textChannel = await channelManager.create("Text Channel", {
        type: "GUILD_TEXT",
        topic: `Private text channel for members of <#${secondary.id}>.`,
        permissionOverwrites: [
          { id: channelManager.guild.roles.everyone, deny: "VIEW_CHANNEL" },
          { id: member?.id, allow: "VIEW_CHANNEL" },
        ],
        parent: secondary.parent ?? undefined,
      });
      await textChannel.send({
        embeds: [
          new Embed()
            .setTitle("Welcome!")
            .setColor(3447003)
            .setDescription(
              `Welcome to your very own private text chat. This channel is only to people in <#${secondary.id}>.`
            )
            .setAuthor({
              name: "Dynamica",
              url: "https://dynamica.dev",
              iconURL: "https://dynamica.dev/img/dynamica.png",
            }),
        ],
      });
      return textChannel.id;
    }
  };

  const secondaryDb = await db.secondary.create({
    data: {
      id: secondary.id,
      creator: member?.id,
      primaryId,
      guildId: channelManager.guild.id,
      textChannelId: await textChannelId(),
    },
  });

  await updateActivityCount(channelManager.client);
  await logger.debug(
    `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${channelManager.guild.name}.`
  );
};

/**
 * Refresh a voice channel
 * @param channel
 * @returns a promise
 */
export async function editChannel({ channel }: { channel: VoiceBasedChannel }) {
  const secondary = await db.secondary.findUnique({
    where: { id: channel.id },
    include: {
      primary: true,
      guild: true,
    },
  });

  /**
   * Return aliases
   */
  const aliases = await db.alias.findMany({
    where: {
      guildId: channel.guildId,
    },
  });
  /**
   * The discord channel to be refreshed
   */

  /**
   * The name of the creator based on the config
   */
  const channelCreator = secondary.creator
    ? channel.members.get(secondary.creator)?.displayName
    : undefined;

  /**
   * The creator or, alternatively the person who will become the creator.
   */
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;

  /**
   * Get the activities of all the members of the channel.
   */
  const activities = Array.from(channel.members).flatMap((entry) => {
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
  const str = secondary.name
    ? secondary.name
    : !filteredActivityList.length
    ? secondary.primary.generalName
    : secondary.primary.template;

  /**
   * The formatted name
   */
  const name = formatChannelName(str, {
    creator: creator ? creator : "",
    aliases: aliases,
    channelNumber: 1,
    activities: filteredActivityList,
    memberCount: channel.members.size, // Get this
    locked,
  });

  if (channel.name === name) return;
  if (!channel.manageable) {
    await logger.debug(`Failed to edit channel ${channel.id}.`);
    return;
  }
  channel
    .edit({
      name,
    })
    .then(() => {
      logger.debug(
        `Secondary channel ${channel.name} in ${channel.guild.name} name changed.`
      );
    });
}

// const renameThrottle = pThrottle({
//   limit: 2,
//   interval: 600000,
// });

// const throttledRename = renameThrottle(editChannel);
// const renameDebounce = pDebounce(throttledRename, 5000);

import {
  ApplicationCommandManager,
  ChannelManager,
  GuildApplicationCommandManager,
  GuildMemberManager,
} from "discord.js";

/**
 * Get a channel that might be cached.
 * @param channelManager Discord Channel Manager
 * @param id The channel ID to get
 * @returns Channel
 */
export const getChannel = async (channelManager: ChannelManager, id: string) =>
  channelManager.cache.some((channel) => id === channel.id)
    ? channelManager.cache.get(id)
    : undefined;

/**
 * Get a guild member.
 * @param guildMemberManager Discord guild member manager
 * @param id The ID of the guild member
 * @returns Discord guild member
 */
export const getGuildMember = async (
  guildMemberManager: GuildMemberManager,
  id: string
) =>
  guildMemberManager.cache.some((member) => member.id === id)
    ? guildMemberManager.cache.get(id)
    : undefined;

/**
 * Gets a list of commands depending on the scope of the bot and cache status.
 * @param guildCommandManager Discord guild command manager
 * @param applicationCommandManager Discord application command manager
 * @returns List of Commands
 */
export const getCommands = async ({
  guildCommandManager,
  applicationCommandManager,
}: {
  guildCommandManager?: GuildApplicationCommandManager;
  applicationCommandManager?: ApplicationCommandManager;
}) => {
  if (!applicationCommandManager && !guildCommandManager) {
    return undefined;
  }
  if (guildCommandManager) {
    return guildCommandManager.cache;
  }
  if (applicationCommandManager) {
    return applicationCommandManager.cache;
  }

  // try {
  // } catch (error) {
  //   logger.error("Error getting commands:", error);
  // }
  // if (!guildCommandManager || !applicationCommandManager) return;
  // const cachedGuildCommands = guildCommandManager.cache;
  // const guildCommands =
  //   cachedGuildCommands?.size === 0 || undefined
  //     ? await guildCommandManager.fetch()
  //     : cachedGuildCommands;

  // const cachedApplicationCommands = applicationCommandManager.cache;
  // const applicationCommands =
  //   cachedApplicationCommands?.size === 0 || undefined
  //     ? await applicationCommandManager.fetch()
  //     : cachedApplicationCommands;
  // return process.env.GUILD_ID ? guildCommands : applicationCommands;
};

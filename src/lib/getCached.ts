import {
  ApplicationCommand,
  ApplicationCommandManager,
  ChannelManager,
  Collection,
  GuildApplicationCommandManager,
  GuildMemberManager,
  GuildResolvable,
} from "discord.js";
import { logger } from "..";

/**
 * Get a channel that might be cached.
 * @param channelManager Discord Channel Manager
 * @param id The channel ID to get
 * @returns Channel
 */
export const getChannel = async (
  channelManager: ChannelManager,
  id: string
) => {
  try {
    const cachedChannel = channelManager.cache.get(id);
    return cachedChannel ?? (await channelManager.fetch(id));
  } catch (error) {
    logger.error("Error getting channel:", error);
  }
};

/**
 * Get a guild member.
 * @param guildMemberManager Discord guild member manager
 * @param id The ID of the guild member
 * @returns Discord guild member
 */
export const getGuildMember = async (
  guildMemberManager: GuildMemberManager,
  id: string
) => {
  try {
    if (!guildMemberManager) return;
    const cachedGuildMember = guildMemberManager.cache.find(
      (guildMember) => guildMember.id === id
    );
    return cachedGuildMember ?? (await guildMemberManager.fetch(id));
  } catch (error) {
    logger.error("Error getting guild member:", error);
  }
};

/**
 * Gets a list of commands depending on the scope of the bot and cache status.
 * @param guildCommandManager Discord guild command manager
 * @param applicationCommandManager Discord application command manager
 * @returns List of Commands
 */
export const getCommands: (
  guildCommandManager?: GuildApplicationCommandManager,
  applicationCommandManager?: ApplicationCommandManager
) => Promise<
  | Collection<
      string,
      ApplicationCommand<{
        guild?: GuildResolvable;
      }>
    >
  | undefined
> = async (guildCommandManager, applicationCommandManager) => {
  try {
  } catch (error) {
    logger.error("Error getting commands:", error);
  }
  if (!guildCommandManager || !applicationCommandManager) return;
  const cachedGuildCommands = guildCommandManager.cache;
  const guildCommands =
    cachedGuildCommands?.size === 0 || undefined
      ? await guildCommandManager.fetch()
      : cachedGuildCommands;

  const cachedApplicationCommands = applicationCommandManager.cache;
  const applicationCommands =
    cachedApplicationCommands?.size === 0 || undefined
      ? await applicationCommandManager.fetch()
      : cachedApplicationCommands;
  return process.env.GUILD_ID ? guildCommands : applicationCommands;
};

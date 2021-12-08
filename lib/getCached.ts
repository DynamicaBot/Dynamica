import {
  ApplicationCommandManager,
  ChannelManager,
  GuildApplicationCommandManager,
  GuildMemberManager,
  GuildMemberRoleManager,
  Role,
} from "discord.js";

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
  const cachedChannel = channelManager.cache.get(id);
  return cachedChannel ? cachedChannel : await channelManager.fetch(id);
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
  if (!guildMemberManager) return;
  const cachedGuildMember = guildMemberManager.cache.find(
    (guildMember) => guildMember.id === id
  );
  return cachedGuildMember
    ? cachedGuildMember
    : await guildMemberManager.fetch(id);
};

export const getCommands = async (
  guildCommandManager?: GuildApplicationCommandManager,
  applicationCommandManager?: ApplicationCommandManager
) => {
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

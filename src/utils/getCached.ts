import { ChannelManager, GuildMemberManager } from "discord.js";

/**
 * Get a channel that might be cached.
 * @param channelManager Discord Channel Manager
 * @param id The channel ID to get
 * @returns Channel
 */
export const getChannel = (channelManager: ChannelManager, id: string) =>
  channelManager.cache.get(id);

/**
 * Get a guild member.
 * @param guildMemberManager Discord guild member manager
 * @param id The ID of the guild member
 * @returns Discord guild member
 */
export const getGuildMember = (
  guildMemberManager: GuildMemberManager,
  id: string
) =>
  guildMemberManager.cache.some((member) => member.id === id)
    ? guildMemberManager.cache.get(id)
    : undefined;

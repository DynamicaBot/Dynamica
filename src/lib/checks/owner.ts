import { db } from "@db";
import { BaseGuildVoiceChannel, GuildMember } from "discord.js";

/**
 * Checks if a guild member is the creator of the secondary channel.
 * @param channel Discord Voice Channel
 * @param member The member who executed the command
 * @returns Boolean if the member is the owner of the channel
 */
export const checkOwner = async (
  channel: BaseGuildVoiceChannel,
  member: GuildMember
) => {
  const { id } = channel;
  const channelProperties = await db.secondary.findUnique({
    where: { id },
  });
  if (!channelProperties) {
    return false;
  }
  return member.id === channelProperties?.creator;
};

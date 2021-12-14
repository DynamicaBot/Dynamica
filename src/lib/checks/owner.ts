import { BaseGuildVoiceChannel, GuildMember } from "discord.js";
import { prisma } from "../prisma";

export const checkOwner = async (
  channel: BaseGuildVoiceChannel,
  member: GuildMember
) => {
  const { id } = channel;
  const channelProperties = await prisma.secondary.findUnique({
    where: { id },
  });
  if (!channelProperties) {
    return false;
  }
  return member.id === channelProperties?.creator 
};

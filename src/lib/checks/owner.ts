import { getGuildMember } from "../getCached";
import { db } from "../prisma";
import { Check } from "./check";
import { checkPermissions } from "./permissions";

/**
 * Checks if a guild member is the creator of the secondary channel.
 * @param interaction The interaction which to check.
 * @returns Promise Boolean if the person who triggered the interaction is the owner of the voice channel that they're in.
 */
export const checkOwner: Check = async (interaction) => {
  const member = await getGuildMember(
    interaction.guild.members,
    interaction.user.id
  );
  const id = member.voice.channelId;
  const channelProperties = await db.secondary.findUnique({
    where: { id },
  });
  if (!channelProperties) {
    return false;
  }

  return (
    (await checkPermissions(interaction)) ||
    member.id === channelProperties?.creator
  );
};

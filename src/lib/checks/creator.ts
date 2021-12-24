import { ErrorEmbed } from "../discordEmbeds";
import { getGuildMember } from "../getCached";
import { db } from "../prisma";
import { Check } from "./check";

/**
 * Checks if a guild member is the creator of the secondary channel. (overridden by manager and admin)
 * @param interaction The interaction which to check.
 * @returns Promise Boolean if the person who triggered the interaction is the owner of the voice channel that they're in.
 */
export const checkCreator: Check = async (interaction) => {
  const guildMember = await getGuildMember(
    interaction.guild.members,
    interaction.user.id
  );

  const id = guildMember.voice.channelId;
  const channelProperties = await db.secondary.findUnique({
    where: { id },
  });

  if (!channelProperties) {
    return false;
  }

  const dynamicaManager = guildMember?.roles.cache.some(
    (role) => role.name === "Dynamica Manager"
  );

  const admin = guildMember.permissions.has("ADMINISTRATOR");

  const creator = guildMember.id === channelProperties?.creator;

  if (!creator && !dynamicaManager && !admin) {
    interaction.reply({
      embeds: [ErrorEmbed("You must be the creator of the channel.")],
    });
  }

  return admin || dynamicaManager || creator;
};

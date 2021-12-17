import { CommandInteraction } from "discord.js";
import { getGuildMember } from "../getCached";

/**
 * Checks permissions for admin or Dynamica Manager role.
 * @param interaction Discord Interaction
 * @returns Boolean if the member has permission to manage dynamica channels.
 */
export const checkPermissions = async (interaction: CommandInteraction) => {
  if (!interaction.guild) return false;
  const guildMember = await getGuildMember(
    interaction.guild.members,
    interaction.user.id
  );
  return (
    guildMember?.roles.cache.some((role) => role.name === "Dynamica Manager") ||
    guildMember?.permissions.has("ADMINISTRATOR")
  );
};

import { CommandInteraction } from "discord.js";
import { ErrorEmbed } from "../discordEmbeds";
import { getGuildMember } from "../getCached";

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

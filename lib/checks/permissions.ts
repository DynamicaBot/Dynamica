import { CommandInteraction } from "discord.js";
import { ErrorEmbed } from "../discordEmbeds";
import { getGuildMember } from "../getCached";

export const checkPermissions = async (interaction: CommandInteraction) => {
  if (!interaction.guild) return false;
  const guildMember = await getGuildMember(
    interaction.guild.members,
    interaction.user.id
  );
  if (
    guildMember?.roles.cache.some((role) => role.name === "Dynamica Manager") ||
    guildMember?.permissions.has("ADMINISTRATOR")
  ) {
    return false;
  } else {
    interaction.reply({
      ephemeral: true,
      embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
    });
    return true;
  }
};

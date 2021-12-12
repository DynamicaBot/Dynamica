import { CommandInteraction } from "discord.js";
import { ErrorEmbed } from "../discordEmbeds";
import { getGuildMember } from "../getCached";
import { prisma } from "../prisma";

export const checkSecondary = async (interaction: CommandInteraction) => {
  if (!interaction.guild?.members) return;
  const guildMember = await getGuildMember(
    interaction.guild?.members,
    interaction.user.id
  );

  const channel = guildMember?.voice.channel;

  const channelConfig = await prisma.secondary.findUnique({
    where: {
      id: channel?.id,
    },
  });
  if (!channelConfig) {
    await interaction.reply({
      ephemeral: true,
      embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
    });
    return false;
  } else {
    return true;
  }
};

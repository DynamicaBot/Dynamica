import { SlashCommandBuilder } from "@discordjs/builders";
import { checkPermissions } from "@lib/checks/permissions";
import { checkSecondary } from "@lib/checks/validSecondary";
import { ErrorEmbed, SuccessEmbed } from "@lib/discordEmbeds";
import { getGuildMember } from "@lib/getCached";
import { db } from "@lib/prisma";
import { CommandInteraction } from "discord.js";
import { Command } from "./command";

// Set General Template
export const general: Command = {
  data: new SlashCommandBuilder()
    .setName("general")
    .setDescription("Edit the name/template for the default general channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new template for the general channel.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const name = interaction.options.getString("name", true);

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );

    const voiceId = guildMember?.voice.channelId;

    // Check if the user is in a voice channel.
    if (!voiceId) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
      });
      return;
    }

    // Find a valid secondary channel
    const secondary = await db.secondary.findUnique({
      where: {
        id: voiceId,
      },
      include: {
        primary: true,
      },
    });

    // Error response for no secondary
    if (!(await checkSecondary(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid Dynamica channel.")],
      });
      return;
    }

    // Check dynamica role
    if (!(await checkPermissions(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
      });
      return;
    }

    if (!secondary) return;
    // Update channel list
    await db.primary.update({
      where: { id: secondary.primary.id },
      data: { generalName: name },
    });

    // Reply with template
    await interaction.reply({
      embeds: [SuccessEmbed(`General template Changed to ${name}`)],
    });
  },
};

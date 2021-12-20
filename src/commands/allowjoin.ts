import { SlashCommandBuilder } from "@discordjs/builders";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { Command } from "./command";

export const allowjoin: Command = {
  data: new SlashCommandBuilder()
    .setName("allowjoin")
    .setDescription("Allow users to request to join a locked channel.")
    .addBooleanOption((option) =>
      option
        .setName("state")
        .setDescription("Whether to enable or disable join requests.")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      interaction.reply({
        embeds: [ErrorEmbed("Must be in a valid guild.")],
        ephemeral: true,
      });
      return;
    }
    if (!(await checkPermissions(interaction))) {
      interaction.reply({
        embeds: [ErrorEmbed("You don't have permission.")],
        ephemeral: true,
      });
      return;
    }
    const state = interaction.options.getBoolean("state", true);
    await db.guild.update({
      where: { id: interaction.guild.id },
      data: {
        allowJoinRequests: state,
      },
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(`${state ? "Disabled" : "Enabled"} Join Requests"`),
      ],
    });
  },
};

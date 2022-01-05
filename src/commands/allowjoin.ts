import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager } from "../lib/checks";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { Command } from "./";

export const allowjoin: Command = {
  conditions: [checkManager],
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
        SuccessEmbed(`${!state ? "Disabled" : "Enabled"} Join Requests`),
      ],
    });
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { db } from "../utils/prisma";

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

  async execute(interaction: CommandInteraction) {
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

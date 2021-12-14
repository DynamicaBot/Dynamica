import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { prisma } from "../lib/prisma";

export const text = {
  data: new SlashCommandBuilder()
    .setName("text")
    .setDescription("Enable or disable temporary text channels")
    .addBooleanOption((option) =>
      option
        .setName("state")
        .setDescription(
          "Set to true to enable text channels. Set to false to disable them."
        )
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const state = interaction.options.getBoolean("state", true);
    if (!interaction.guildId) return;
    if (!(await checkPermissions(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          ErrorEmbed("Must have the Dynamica role to manage server settings."),
        ],
      });
      return;
    }
    await prisma.guild.update({
      where: { id: interaction.guildId },
      data: {
        textChannelsEnabled: state,
      },
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Temporary text channels ${
            state ? "disabled" : "disabled"
          } for all future created channels.`
        ),
      ],
    });
  },
};

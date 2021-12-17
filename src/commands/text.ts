import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { updateGuild } from "../lib/operations/guild";
import { Command } from "./command";

export const text: Command = {
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
    await updateGuild(interaction.guildId, { textChannelsEnabled: state });
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

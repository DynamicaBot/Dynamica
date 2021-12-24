import { SlashCommandBuilder } from "@discordjs/builders";
import { checkGuild } from "../lib/checks/guild";
import { checkPermissions } from "../lib/checks/permissions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { updateGuild } from "../lib/operations/guild";
import { Command } from "./command";

export const text: Command = {
  conditions: [checkPermissions, checkGuild],
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
  async execute(interaction) {
    const state = interaction.options.getBoolean("state", true);
    if (!interaction.guildId) return;

    await updateGuild(interaction.guildId, { textChannelsEnabled: state });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Temporary text channels ${
            !state ? "disabled" : "disabled"
          } for all future created channels.`
        ),
      ],
    });
  },
};

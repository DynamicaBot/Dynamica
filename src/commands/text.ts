import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { updateGuild } from "../utils/operations/guild.js";

export const text: Command = {
  conditions: [checkManager],
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

  async execute(interaction: CommandInteraction): Promise<void> {
    const state = interaction.options.getBoolean("state", true);
    if (!interaction.guildId) return;

    await updateGuild(interaction.guildId, { textChannelsEnabled: state });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Temporary text channels ${
            !state ? "disabled" : "enabled"
          } for all future created channels.`
        ),
      ],
    });
  },
};

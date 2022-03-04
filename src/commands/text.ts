import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { updateGuild } from "../utils/operations/guild.js";

export const text: Command = {
  conditions: [checkManager, checkAdminPermissions],
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
  helpText: {
    short: "Enables or disabled temporary text channels.",
    long: "Enables or disabled temporary text channels. \n Said channels are created at the same time as secondary channels and may only be accessed by members inside the voice channel. \n The name of the channel remains the same no matter the template used.",
  },
  async execute(interaction) {
    const state = interaction.options.getBoolean("state", true);

    updateGuild(interaction.guildId, { textChannelsEnabled: state });

    return interaction.reply(
      `Temporary text channels ${
        !state ? "disabled" : "enabled"
      } for all future created channels.`
    );
  },
};

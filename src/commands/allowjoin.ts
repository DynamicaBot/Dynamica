import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { db } from "../utils/db";

export const allowjoin: Command = {
  conditions: [checkManager, checkAdminPermissions],
  data: new SlashCommandBuilder()
    .setName("allowjoin")
    .setDescription("Allow users to request to join a locked channel.")
    .addBooleanOption((option) =>
      option
        .setName("state")
        .setDescription("Whether to enable or disable join requests.")
        .setRequired(true)
    ),
  helpText: {
    short:
      "Toggles whether or not members of your sever are allowed to request to join private channels.",
  },
  async execute(interaction: CommandInteraction) {
    const state = interaction.options.getBoolean("state", true);
    db.guild.update({
      where: { id: interaction.guild.id },
      data: {
        allowJoinRequests: state,
      },
    });
    return interaction.reply(`${state ? "Enabled" : "Disabled"} Join Requests`);
  },
};

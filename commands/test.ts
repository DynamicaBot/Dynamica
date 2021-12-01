import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test command"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      content: `Test`,
      ephemeral: true,
    });
  },
};

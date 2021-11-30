import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from "@discordjs/builders";
import { db } from "../lib/keyv";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test command"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      content: `Value for this user is ${await db.get(interaction.user.id)}`,
      ephemeral: true,
    });
  },
};

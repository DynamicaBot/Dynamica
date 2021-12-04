import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("source")
    .setDescription("Get the source code for this bot."),
  async execute(interaction: CommandInteraction) {
    interaction.reply({ content: `https://github.com/sebasptsch/Dynamica` });
  },
};

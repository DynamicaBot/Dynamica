import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { version as w } from "../version.js";
import { Command } from "./command.js";

export const version: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("The version of the bot in use."),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      content: `The version of the bot is \`${w}\`.`,
    });
  },
};

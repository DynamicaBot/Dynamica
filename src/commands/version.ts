import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import versionFile from "../version.json";
import { Command } from "./command";

export const version: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("The version of the bot in use."),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      content: `The version of the bot is \`${versionFile.version}\`.`,
    });
  },
};

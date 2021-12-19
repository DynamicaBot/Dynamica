import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import version from "../version.json";
import { Command } from "./command";

export const avc: Command = {
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("The version of the bot in use."),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      content: `The version of the bot is \`${version.version}\`.`,
    });
  },
};

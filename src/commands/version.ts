import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { version as w } from "../version.js";

export const version: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("The version of the bot in use."),

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({
      ephemeral: true,
      content: `The version of the bot is \`${w}\`.`,
    });
  },
};

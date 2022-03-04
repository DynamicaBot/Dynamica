import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command.js";

export const version: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("The version of the bot in use."),
  helpText: { short: "Sends the running version of Dynamica." },
  async execute(interaction) {
    interaction.reply({
      ephemeral: true,
      content: `The version of the bot is \`${process.env.DRONE_TAG}\`.`,
    });
  },
};

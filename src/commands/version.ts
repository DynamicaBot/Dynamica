import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";

export const version = new Command()
  .setCommandData(
    new SlashCommandBuilder()
      .setName("version")
      .setDescription("The version of the bot in use.")
  )
  .setHelpText("Sends the running version of Dynamica.")
  .setResponse(async (interaction) => {
    interaction.reply({
      ephemeral: true,
      content: `The version of the bot is \`${process.env.VERSION}\`.`,
    });
  });

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { version as w } from "../version.js";
import { CommandBuilder } from "./";

export const version = new CommandBuilder()
  .setConditions([])
  .setData(
    new SlashCommandBuilder()
      .setName("version")
      .setDescription("The version of the bot in use.")
  )
  .setResponse(async (interaction: CommandInteraction) => {
    interaction.reply({
      content: `The version of the bot is \`${w}\`.`,
    });
  });

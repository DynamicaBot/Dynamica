import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandBuilder } from "./";

export const ping = new CommandBuilder()
  .setConditions([])
  .setData(
    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
  )
  .setResponse(async (interaction: CommandInteraction) => {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
  });

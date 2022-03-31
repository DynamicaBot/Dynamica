import Command from "@classes/command";
import { SlashCommandBuilder } from "@discordjs/builders";

export const ping = new Command()
  .setCommandData(
    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
  )
  .setHelpText(
    "Returns the Pong and the ping of the server you're currently in."
  )
  .setResponse(async interaction => {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
  });

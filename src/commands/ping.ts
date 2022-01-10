import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const ping: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  helpText: {
    short: "Returns the Pong and the ping of the server you're currently in.",
  },
  async execute(interaction) {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
  },
};

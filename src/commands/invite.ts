import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const invite: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite for your own server!"),
  helpText: { short: "Sends an invitation to invite the bot to more servers." },
  async execute(interaction) {
    interaction.reply({
      ephemeral: true,
      content: `https://dynamica.dev/invite`,
    });
  },
};

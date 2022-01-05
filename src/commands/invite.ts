import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "./";

export const invite: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite for your own server!"),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      ephemeral: true,
      content: `https://dynamica.dev/invite`,
    });
  },
};

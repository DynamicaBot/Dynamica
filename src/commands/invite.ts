import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";

export const invite: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite for your own server!"),

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({
      ephemeral: true,
      content: `https://dynamica.dev/invite`,
    });
  },
};

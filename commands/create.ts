import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { createPrimary } from "../lib/operations";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel."),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      await interaction.reply({
        content: "Bot requires manage channel permissions.",
      });
      return;
    }

    await createPrimary(interaction.guild.channels, interaction.user.id);
    await interaction.reply({
      content: `New voice channel successfully created.`,
    });
  },
};

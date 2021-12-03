import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel."),
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply();
    if (!interaction.memberPermissions?.has("MANAGE_CHANNELS")) {
      await interaction.reply({
        content: "User requires manage channel permissions.",
      });
      return;
    }

    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      await interaction.reply({
        content: "Bot requires manage channel permissions.",
      });
      return;
    }

    const channel = await interaction.guild?.channels.create(
      "Primary Channel",
      {
        type: "GUILD_VOICE",
      }
    );

    await prisma.primary.create({
      data: {
        id: channel.id,
        creator: interaction.user.id,
      },
    });

    await interaction.reply({
      content: `New voice channel successfully created.`,
    });
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel.")
    .addStringOption((option) =>
      option
        .setName("channelname")
        .setDescription("Channel Name")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("createabove")
        .setDescription(
          "Whether subchannels should be created above or below the primary channel."
        )
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    if (!interaction.memberPermissions?.has("MANAGE_CHANNELS")) {
      interaction.reply({
        content: "User requires manage channel permissions.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      interaction.reply({
        content: "Bot requires manage channel permissions.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    const name =
      (await interaction.options.getString("channelname")) || "Primary Channel";
    const channel = await interaction.guild?.channels.create(name, {
      type: "GUILD_VOICE",
    });

    const create_above = interaction.options.getBoolean("above");

    await prisma.primaryChannel.create({
      data: {
        channelId: channel.id,
        name,
        general_name: "General",
        creator: interaction.user.id,
        create_above: !!create_above,
      },
    });

    await interaction.editReply({
      content: `New voice channel successfully created.`,
    });
  },
};

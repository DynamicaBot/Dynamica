import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a primary channel.")
    .addChannelOption((option) =>
      option
        .addChannelType(2)
        .setDescription("Select a channel managed by the bot to remove.")
        .setName("targetchannel")
        .setRequired(true)
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

    const channel = interaction.options.getChannel("targetchannel");
    if (channel) {
      const existingChannelConfig = await prisma.primaryChannel.findUnique({
        where: { id: channel.id },
      });
      if (existingChannelConfig) {
        await interaction.deferReply();
        const channelManager = await interaction.guild?.channels.fetch(
          channel.id
        );

        await Promise.all([
          // Complete all tasks then mark command as complete
          prisma.primaryChannel.delete({ where: { id: channel.id } }),
          channelManager?.delete("Channel deleted by bot."),
        ]);
        await interaction.editReply({
          content: `Successfully removed channel: ${channel.name}`,
        });
      } else {
        await interaction.reply({
          ephemeral: true,
          content: `Channel ${channel.id} not created by bot.`,
        });
      }
    }
  },
};

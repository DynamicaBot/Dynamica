import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { Subchannel } from "@prisma/client";
import { CommandInteraction } from "discord.js";
import { prisma } from "../lib/prisma";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Modify/View Configuration")
    .addSubcommandGroup((group) =>
      group
        .setName("edit")
        .setDescription("Edit Primary Channel Configuration")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("name")
            .setDescription("Edit the name of the primary channel.")
            .addChannelOption((option) =>
              option
                .addChannelType(2)
                .setRequired(true)
                .setName("targetchannel")
                .setDescription(
                  "The target channel (must be managed by the bot)"
                )
            )
            .addStringOption((option) =>
              option
                .setName("newchannelname")
                .setRequired(true)
                .setDescription("The new channel name")
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("generalname")
            .setDescription(
              "The default name for automagically created channels."
            )
            .addChannelOption((option) =>
              option
                .setName("targetchannel")
                .addChannelType(2)
                .setDescription(
                  "The target channel (must be managed by the bot)"
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("newgeneralname")
                .setRequired(true)
                .setDescription("The new general name or template (WIP)")
            )
        )
    )
    .addSubcommand((group) =>
      group
        .setName("view")
        .setDescription("View Current Configuration")
        .addChannelOption((option) =>
          option
            .setName("targetchannel")
            .addChannelType(2)
            .setDescription("The target channel (must be managed by the bot)")
            .setRequired(true)
        )
    ),
  async execute(interaction: CommandInteraction) {
    if (interaction.options.getSubcommand() === "view") {
      const targetChannel = interaction.options.getChannel(
        "targetchannel",
        true
      );

      await interaction.deferReply({ ephemeral: true });

      const channelConfig = await prisma.primaryChannel.findUnique({
        where: {
          channelId: targetChannel.id,
        },
        include: {
          subchannels: true,
        },
      });
      if (!channelConfig) {
        await interaction.editReply("Channel not managed by bot.");
        return;
      }

      const creator = await interaction.guild?.members.fetch(
        channelConfig.creator
      );
      const messageEmbed = new Embed()
        .addField({ name: "Name", value: channelConfig.name })
        .addField({ name: "General Name", value: channelConfig.general_name })
        .addField({ name: "Creator", value: `${creator?.displayName}` });

      await interaction.editReply({
        embeds: [messageEmbed],
      });
    } else if (interaction.options.getSubcommandGroup() === "edit") {
      if (!interaction.memberPermissions?.has("MANAGE_CHANNELS")) {
        interaction.editReply({
          content: "User requires manage channel permissions.",
        });
        return;
      }

      if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
        interaction.editReply({
          content: "Bot requires manage channel permissions.",
        });
        return;
      }

      if (interaction.options.getSubcommand() === "name") {
        await interaction.deferReply({ ephemeral: true });
        const targetChannel = interaction.options.getChannel(
          "targetchannel",
          true
        );
        const newChannelName = interaction.options.getString(
          "newchannelname",
          true
        );

        const channelConfig = await prisma.primaryChannel.findUnique({
          where: {
            channelId: targetChannel.id,
          },
        });

        if (!channelConfig) {
          await interaction.editReply("Channel not managed by bot.");
          return;
        }
        await prisma.primaryChannel.update({
          where: {
            channelId: targetChannel.id,
          },
          data: {
            name: newChannelName,
          },
        });
        const channel = await interaction.guild?.channels.fetch(
          targetChannel.id
        );
        await channel?.edit({ name: newChannelName }, "Edit command");
        await interaction.editReply({ content: `New name saved and applied.` });
      } else if (interaction.options.getSubcommand() === "generalname") {
        const targetChannel = interaction.options.getChannel(
          "targetchannel",
          true
        );
        const newGeneralName = interaction.options.getString(
          "newgeneralname",
          true
        );
        await interaction.deferReply({ ephemeral: true });

        // const channelConfig = await channels.get(targetChannel.id);
        const channelConfig = await prisma.primaryChannel.findUnique({
          where: {
            channelId: targetChannel.id,
          },
        });
        if (!channelConfig) {
          await interaction.editReply("Channel not managed by bot.");
          return;
        }
        // channelConfig.general_name = newGeneralName;
        // await channels.set(targetChannel.id, channelConfig);
        await prisma.primaryChannel.update({
          where: {
            channelId: targetChannel.id,
          },
          data: {
            general_name: newGeneralName,
          },
        });
        await interaction.editReply(
          "Updated Config. May take some time to update."
        );
      }
    }
  },
};

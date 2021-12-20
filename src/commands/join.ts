import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getChannel } from "../lib/getCached";
import { db } from "../lib/prisma";
import { Command } from "./command";

export const join: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(`Request to join a locked voice channel.`)
    .addChannelOption((options) =>
      options
        .addChannelType(2)
        .setRequired(true)
        .setName("channel")
        .setDescription("The channel you wish to join.")
    ),
  async execute(interaction: CommandInteraction) {
    const channel = interaction.options.getChannel("channel", true);
    const channelConfig = await db.secondary.findUnique({
      where: { id: channel.id },
    });
    if (!channelConfig) {
      interaction.reply("Not a valid Dynamica channel.");
      return;
    }

    const { creator } = channelConfig;

    const row = new MessageActionRow().addComponents(
      new MessageButton({
        customId: "channeljoinaccept",
        style: "SUCCESS",
        label: "Allow",
      }),
      new MessageButton({
        customId: "channeljoindeny",
        style: "DANGER",
        label: "Deny",
      })
    );
    interaction.reply({
      components: [row],
      content: `Does <@${interaction.user.id}> have permission to join <#${channel.id}> ? As the creator <@${creator}>, are they allowed to join?`,
    });
    interaction.channel
      .createMessageComponentCollector({ componentType: "BUTTON" })
      .once("collect", async (collected) => {
        if (collected.user.id !== channelConfig.creator) {
          collected.reply({
            ephemeral: true,
            embeds: [
              SuccessEmbed("You're not the user who created the channel."),
            ],
          });
          return;
        }
        const button = collected;
        if (button.customId === "channeljoinaccept") {
          const discordChannel = await getChannel(
            interaction.guild.channels,
            channel.id
          );
          if (!discordChannel.isVoice()) return;

          await discordChannel.permissionOverwrites.create(interaction.user, {
            CONNECT: true,
          });
          await interaction.editReply({
            content: null,
            components: [],
            embeds: [
              SuccessEmbed("You have been granted access to the channel."),
            ],
          });
          await collected.reply({
            ephemeral: true,
            embeds: [SuccessEmbed("You have granted access to the channel.")],
          });
        } else if (button.customId === "channeljoindeny") {
          await interaction.editReply({
            content: null,
            components: [],
            embeds: [ErrorEmbed("You have been denied access to the channel.")],
          });
          await collected.reply({
            embeds: [SuccessEmbed("You have denied access to the channel.")],
            ephemeral: true,
          });
        } else {
          interaction.reply("Wrong button");
        }
      });
  },
};

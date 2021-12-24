import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from "discord.js";
import { ErrorEmbed, InfoEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getChannel } from "../lib/getCached";
import { db } from "../lib/prisma";
import { Command } from "./command";

export const join: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(`Request to join a locked voice channel.`),

  async execute(interaction: CommandInteraction) {
    const secondaries = await db.secondary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availablePrimaryChannels = discordChannels.filter((discordChannel) =>
      secondaries.find((primary) => discordChannel.id === primary.id)
    );

    if (availablePrimaryChannels.length === 0) {
      interaction.reply({
        embeds: [InfoEmbed("No Primary channels.")],
        ephemeral: true,
      });
      return;
    }

    const channelsrow = new MessageActionRow().addComponents(
      new MessageSelectMenu().setCustomId("generalchannelselect").addOptions(
        availablePrimaryChannels.map((primaryChannel) => ({
          label: primaryChannel.name,
          value: primaryChannel.id,
        }))
      )
    );

    await interaction.reply({
      content: "Available Channels",
      components: [channelsrow],
      ephemeral: true,
    });

    interaction.channel
      .createMessageComponentCollector({
        componentType: "SELECT_MENU",
        filter: (collected) => collected.user.id === interaction.user.id,
      })
      .once("collect", async (collected) => {
        const selectedChannel = collected.values[0];
        const channelConfig = await db.secondary.findUnique({
          where: { id: selectedChannel },
          include: { guild: true },
        });
        if (!channelConfig.guild.allowJoinRequests) {
          collected.update({
            content: "Error",
            embeds: [
              ErrorEmbed("Join Requests are not enabled on this server."),
            ],
            components: [],
          });
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
        interaction.followUp({
          components: [row],
          content: `Does <@${interaction.user.id}> have permission to join <#${selectedChannel}> ? As the creator <@${creator}>, are they allowed to join?`,
        });
        collected.update({
          content: "Success",
          embeds: [SuccessEmbed("Message sent")],
          components: [],
        });
        interaction.channel
          .createMessageComponentCollector({
            componentType: "BUTTON",
            filter: (filteritem) =>
              filteritem.user.id === channelConfig.creator,
          })
          .once("collect", async (collected) => {
            const button = collected;
            if (button.customId === "channeljoinaccept") {
              const discordChannel = await getChannel(
                interaction.guild.channels,
                selectedChannel
              );
              if (!discordChannel.isVoice()) return;

              await discordChannel.permissionOverwrites.create(
                interaction.user,
                {
                  CONNECT: true,
                }
              );
              await interaction.editReply({
                content: null,
                components: [],
                embeds: [
                  SuccessEmbed("You have been granted access to the channel."),
                ],
              });
              await collected.reply({
                ephemeral: true,
                embeds: [
                  SuccessEmbed("You have granted access to the channel."),
                ],
              });
            } else if (button.customId === "channeljoindeny") {
              await interaction.editReply({
                content: null,
                components: [],
                embeds: [
                  ErrorEmbed("You have been denied access to the channel."),
                ],
              });
              await collected.reply({
                embeds: [
                  SuccessEmbed("You have denied access to the channel."),
                ],
                ephemeral: true,
              });
            } else {
              interaction.reply("Wrong button");
            }
          });
      });
  },
};

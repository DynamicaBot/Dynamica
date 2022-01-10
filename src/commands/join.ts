import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../Command";
import { db } from "../utils/db";
import { ErrorEmbed, SuccessEmbed } from "../utils/discordEmbeds";
import { getChannel } from "../utils/getCached";

export const join: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(`Request to join a locked voice channel.`)
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName("channel")
        .setDescription("The channel to request to join.")
        .setRequired(true)
    ),
  helpText: {
    short:
      "If join requests are enabled then you can request to join locked secondary channels.",
  },
  async execute(interaction) {
    const channel = interaction.options.getString("channel", true);

    if (!interaction.guild) return;

    const channelConfig = await db.secondary.findUnique({
      where: { id: channel },
      include: { guild: true },
    });
    if (!channelConfig.guild.allowJoinRequests) {
      return interaction.reply({
        content: "Error",
        embeds: [ErrorEmbed("Join Requests are not enabled on this server.")],
      });
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
      content: `Does <@${interaction.user.id}> have permission to join <#${channel}>? As the creator <@${creator}>, are they allowed to join?`,
    });
    interaction.channel
      .createMessageComponentCollector({
        componentType: "BUTTON",
        filter: (filteritem) => filteritem.user.id === channelConfig.creator,
      })
      .once("collect", async (collected) => {
        const button = collected;
        if (button.customId === "channeljoinaccept") {
          const discordChannel = await getChannel(
            interaction.guild.channels,
            channel
          );
          if (!discordChannel.isVoice()) return;

          await discordChannel.permissionOverwrites.create(interaction.user, {
            CONNECT: true,
          });
          await interaction.editReply({
            content: null,
            components: [],
            embeds: [
              SuccessEmbed(
                `<@${interaction.user.id}> has been granted access to <#${channel}>.`
              ),
            ],
          });
          await collected.reply({
            ephemeral: true,
            embeds: [
              SuccessEmbed(
                `You have granted access for <@${interaction.user.id}> to access <#${channel}>.`
              ),
            ],
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

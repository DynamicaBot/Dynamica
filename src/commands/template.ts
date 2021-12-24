import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu,
} from "discord.js";
import { checkManager } from "../lib/checks";
import { InfoEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { Command } from "./command";

export const template: Command = {
  conditions: [checkManager],
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Edit the template for all secondary channels.")
    .addStringOption((option) =>
      option
        .setName("template")
        .setDescription("The new template for all secondary channels.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const name = interaction.options.getString("template", true);
    const primaries = await db.primary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availablePrimaryChannels = discordChannels.filter((discordChannel) =>
      primaries.find((primary) => discordChannel.id === primary.id)
    );

    if (availablePrimaryChannels.length === 0) {
      interaction.reply({
        embeds: [InfoEmbed("No Primary channels.")],
        ephemeral: true,
      });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu().setCustomId("templatechannelselect").addOptions(
        availablePrimaryChannels.map((primaryChannel) => ({
          label: primaryChannel.name,
          value: primaryChannel.id,
        }))
      )
    );

    await interaction.reply({
      content: "Available Channels",
      components: [row],
      ephemeral: true,
    });

    interaction.channel
      .createMessageComponentCollector({
        componentType: "SELECT_MENU",
        filter: (collected) => collected.user.id === interaction.user.id,
      })
      .once("collect", async (collected) => {
        const selectedChannel = collected.values[0];
        await db.primary.update({
          where: { id: selectedChannel },
          data: { template: name },
        });
        await collected.update({
          components: null,
        });
        await interaction.editReply({
          content: null,
          components: [],
          embeds: [SuccessEmbed(`Template Changed to ${name}.`)],
        });
      });
  },
};

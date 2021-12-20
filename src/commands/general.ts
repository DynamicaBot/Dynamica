import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu,
} from "discord.js";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, InfoEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { Command } from "./command";

// Set General Template
export const general: Command = {
  data: new SlashCommandBuilder()
    .setName("general")
    .setDescription("Edit the name/template for the default general channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new template for the general channel.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const name = interaction.options.getString("name", true);
    const primaries = await db.primary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availablePrimaryChannels = discordChannels.filter((discordChannel) =>
      primaries.find((primary) => discordChannel.id === primary.id)
    );

    // Check dynamica role
    if (!(await checkPermissions(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
      });
      return;
    }

    if (availablePrimaryChannels.length === 0) {
      interaction.reply({
        embeds: [InfoEmbed("No Primary channels.")],
        ephemeral: true,
      });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu().setCustomId("generalchannelselect").addOptions(
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
          data: { generalName: name },
        });
        await collected.update({
          components: null,
        });
        await interaction.editReply({
          content: null,
          components: [],
          embeds: [SuccessEmbed(`General template Changed to ${name}.`)],
        });
      });
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { info } from "../lib/colourfulLogger";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("Edit the name of the current channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new name of the channel (can be a template).")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    if (
      !guildMember?.roles.cache.some((role) => role.name === "Dynamica Manager")
    ) {
      interaction.reply({
        ephemeral: true,
        embeds: [
          ErrorEmbed("Must have the Dynamica role to change the channel name."),
        ],
      });
      return;
    }
    const channel = guildMember?.voice.channel;

    const channelConfig = await prisma.secondary.findUnique({
      where: {
        id: channel?.id,
      },
    });
    if (!channelConfig || !channel) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
      });
    } else {
      await prisma.secondary.update({
        where: { id: channel.id },
        data: {
          name,
        },
      });
      await interaction.reply({
        embeds: [
          SuccessEmbed(
            `Channel name changed to ${name}. Channel may take up to 5 minutes to update.`
          ),
        ],
      });
      info(`${channel.id} name changed.`);
    }
  },
};

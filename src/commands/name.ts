import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkOwner } from "../lib/checks/owner";
import { checkSecondary } from "../lib/checks/validSecondary";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { logger } from "../lib/logger";
import { db } from "../lib/prisma";
import { Command } from "./command";

// Set General Template
export const name: Command = {
  conditions: [checkSecondary, checkOwner],
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

    const channel = guildMember?.voice.channel;

    await db.secondary.update({ where: { id: channel.id }, data: { name } });
    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `Channel name changed to ${name}. Channel may take up to 5 minutes to update.`
        ),
      ],
    });
    logger.info(`${channel.id} name changed.`);
  },
};

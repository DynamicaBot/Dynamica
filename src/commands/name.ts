import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { logger } from "..";
import { Command } from "../Command";
import { checkManager, checkSecondary } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { db } from "../utils/prisma";

export const name: Command = {
  conditions: [checkManager, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("Edit the name of the current channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new name of the channel (can be a template).")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
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

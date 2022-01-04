import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { checkManager, checkSecondary } from "../lib/checks/index.js";
import { SuccessEmbed } from "../lib/discordEmbeds.js";
import { getGuildMember } from "../lib/getCached.js";
import { db } from "../lib/prisma.js";
import { kLogger } from "../tokens.js";
import { Command } from "./command.js";

// Set General Template
export const name: Command = {
  conditions: [checkSecondary, checkManager],
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
    const logger = container.resolve<Signale>(kLogger);
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

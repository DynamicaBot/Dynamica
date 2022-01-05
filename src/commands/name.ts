import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { CommandBuilder } from "../lib/builders";
import { checkManager, checkSecondary } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { db } from "../lib/prisma";
import { kLogger } from "../tokens";

export const name = new CommandBuilder()
  .setConditions([checkSecondary, checkManager])
  .setData(
    new SlashCommandBuilder()
      .setName("name")
      .setDescription("Edit the name of the current channel.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new name of the channel (can be a template).")
          .setRequired(true)
      )
  )
  .setResponse(async (interaction: CommandInteraction) => {
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
  });

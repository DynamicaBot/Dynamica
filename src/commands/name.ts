import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { info } from "../lib/colourfulLogger";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { checkPermissions } from "../lib/checks/permissions";
import { checkSecondary } from "../lib/checks/validSecondary";
import { checkOwner } from "../lib/checks/owner";
import { Command } from "./command";

// Set General Template
export const name: Command = {
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

    if (!(await checkSecondary(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid Dynamica channel.")],
      });
      return;
    }

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    // check if current owner
    if (
      !(
        (await checkOwner(guildMember.voice.channel, guildMember)) ||
        (await checkPermissions(interaction))
      )
    ) {
      interaction.reply({
        embeds: [ErrorEmbed("You are not the current owner of this channel.")],
        ephemeral: true,
      });
      return;
    }
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
  },
};

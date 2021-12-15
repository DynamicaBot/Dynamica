import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkOwner } from "../lib/checks/owner";
import { checkPermissions } from "../lib/checks/permissions";
import { checkSecondary } from "../lib/checks/validSecondary";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { prisma } from "../lib/prisma";
import { Command } from "./command";

export const transfer: Command = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer ownership of secondary channel to another person")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person to transfer ownership to.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user", true);
    if (!interaction.guild) return;
    // check if valid secondary
    if (!(await checkSecondary(interaction))) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid secondary channel")],
      });
      return;
    }

    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );
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

    // set new owner
    await prisma.secondary.update({
      where: {
        id: guildMember.voice.channel.id,
      },
      data: {
        creator: user.id,
      },
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `You have transferred ownership of this channel to ${user.tag}`
        ),
      ],
    });
  },
};

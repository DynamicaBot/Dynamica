import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { info } from "../lib/colourfulLogger";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getChannel, getGuildMember } from "../lib/getCached";
import { checkPermissions } from "../lib/checks/permissions";
import { checkSecondary } from "../lib/checks/validSecondary";
import { checkOwner } from "../lib/checks/owner";

// Set General Template
export const bitrate = {
  data: new SlashCommandBuilder()
    .setName("bitrate")
    .setDescription("Edit the bitrate of the current channel.")
    .addIntegerOption((option) =>
      option
        .setDescription("The bitrate to set the channel to.")
        .setName("number")
    ),
  async execute(interaction: CommandInteraction) {
    const bitrate = interaction.options.getInteger("number");

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

    if (!bitrate) {
      guildMember.voice.channel.edit({ bitrate: 64000 });
      interaction.reply({
        ephemeral: true,
        embeds: [SuccessEmbed("Set bitrate to default.")],
      });
      return;
    }

    if (!(bitrate <= 96 && bitrate >= 8)) {
      interaction.reply({
        embeds: [
          ErrorEmbed(
            "Bitrate (in kbps) should be greater than or equal to 4 or less than or equal to 96."
          ),
        ],
      });
      return;
    }
    await guildMember.voice.channel.edit({
      bitrate: bitrate ? bitrate * 1000 : 64000,
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(`Channel bitrate changed to ${bitrate ?? "default"}kbps.`),
      ],
    });
  },
};

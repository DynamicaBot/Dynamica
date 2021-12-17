import { SlashCommandBuilder } from "@discordjs/builders";
import { checkPermissions } from "@lib/checks/permissions";
import { checkSecondary } from "@lib/checks/validSecondary";
import { ErrorEmbed, SuccessEmbed } from "@lib/discordEmbeds";
import { getGuildMember } from "@lib/getCached";
import { db } from "@lib/prisma";
import { CommandInteraction } from "discord.js";
import { Command } from "./command";

export const allyourbase: Command = {
  data: new SlashCommandBuilder()
    .setName("allyourbase")
    .setDescription(
      "If you are an admin you become the owner of the channel you are in."
    ),
  async execute(interaction: CommandInteraction) {
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
    if (!(await checkPermissions(interaction))) {
      interaction.reply({
        embeds: [ErrorEmbed("You are not an admin.")],
        ephemeral: true,
      });
      return;
    }
    await db.secondary.update({
      where: { id: channel.id },
      data: { creator: interaction.user.id },
    });
    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `Owner of ${guildMember.voice.channel.name} changed to ${guildMember.user.tag}`
        ),
      ],
    });
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager, checkSecondary } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { db } from "../utils/prisma";

export const allyourbase: Command = {
  conditions: [checkManager, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("allyourbase")
    .setDescription(
      "If you are an admin you become the owner of the channel you are in."
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    await db.secondary.update({
      where: { id: channel.id },
      data: { creator: interaction.user.id },
    });
    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `Owner of <#${guildMember.voice.channel.id}> changed to <@${guildMember.user.id}>`
        ),
      ],
    });
  },
};

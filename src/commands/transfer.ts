import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkCreator } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { db } from "../utils/prisma";

export const transfer: Command = {
  conditions: [checkCreator],
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer ownership of secondary channel to another person")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person to transfer ownership to.")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.options.getUser("user", true);
    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );
    if (!guildMember?.voice.channel) return;

    // set new owner
    await db.secondary.update({
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
          `You have transferred ownership of this channel to <@${user.id}>`
        ),
      ],
    });
  },
};

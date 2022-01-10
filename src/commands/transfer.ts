import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkCreator } from "../utils/conditions";
import { db } from "../utils/db";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

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
  helpText: {
    short: "Transfer ownership to another user.",
    long: "Transfer ownership to another user. \n You need to be the owner of the channel in order to transfer ownership.",
  },
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);

    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel) return;

    // set new owner
    db.secondary.update({
      where: {
        id: guildMember.voice.channel.id,
      },
      data: {
        creator: user.id,
      },
    });
    return interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `You have transferred ownership of this channel to <@${user.id}>`
        ),
      ],
    });
  },
};

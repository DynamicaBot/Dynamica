import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkCreator, checkSecondary } from "../lib/checks";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { Command } from "./command";

export const limit: Command = {
  conditions: [checkSecondary, checkCreator],
  data: new SlashCommandBuilder()
    .setName("limit")
    .setDescription(
      "Edit the max number of people allowed in the current channel"
    )
    .addIntegerOption((option) =>
      option
        .setDescription(
          "The maximum number of people that are allowed to join the channel."
        )
        .setName("number")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const userLimit = interaction.options.getInteger("number", true);

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    await guildMember.voice.channel.edit({ userLimit });
    await interaction.reply({
      embeds: [SuccessEmbed(`Channel limit changed to ${userLimit}.`)],
    });
  },
};

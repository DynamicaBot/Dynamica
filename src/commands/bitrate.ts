import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandBuilder } from "../lib/builders";
import { checkCreator, checkSecondary } from "../lib/conditions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";

export const bitrate = new CommandBuilder()
  .setConditions([checkCreator, checkSecondary])
  .setData(
    new SlashCommandBuilder()
      .setName("bitrate")
      .setDescription("Edit the bitrate of the current channel.")
      .addIntegerOption((option) =>
        option
          .setDescription("The bitrate to set the channel to.")
          .setName("number")
      )
  )
  .setResponse(async (interaction: CommandInteraction) => {
    const bitrate = interaction.options.getInteger("number");

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

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
  });

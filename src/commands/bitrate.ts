import { Command } from ".";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { ErrorEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

export const bitrate = new Command()
  .setPreconditions([checkSecondary, checkCreator])
  .setHelpText("Changes the bitrate of the current channel.")
  .setResponse(async (interaction) => {
    const bitrate = interaction.options.getInteger("bitrate");

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      return interaction.reply({
        embeds: [ErrorEmbed("Unable to manage channel.")],
      });
    }

    if (!bitrate) {
      return channel.edit({ bitrate: 64000 }).then(() => {
        interaction.reply("Set bitrate to default.");
      });
    }
    if (!(bitrate <= 96 && bitrate >= 8)) {
      return interaction.reply({
        embeds: [
          ErrorEmbed(
            "Bitrate (in kbps) should be greater than or equal to 4 or less than or equal to 96."
          ),
        ],
      });
    }
    await channel.edit({
      bitrate: bitrate ? bitrate * 1000 : 64000,
    });
    return interaction.reply(
      `<#${channel.id}> bitrate changed to ${bitrate ?? "default"}kbps.`
    );
  });

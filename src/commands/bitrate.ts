import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import { ErrorEmbed } from '@utils/discordEmbeds';

export default new Command()
  .setPreconditions([checkSecondary, checkCreator])
  .setHelpText('Changes the bitrate of the current channel.')
  .setCommandData(
    new SlashCommandBuilder()
      .setName('bitrate')
      .setDescription('Edit the bitrate of the current channel.')
      .addIntegerOption((option) =>
        option
          .setDescription('The bitrate to set the channel to.')
          .setName('bitrate')
      )
  )
  .setResponse(async (interaction) => {
    const bitrate = interaction.options.getInteger('bitrate');

    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      return interaction.reply({
        embeds: [ErrorEmbed('Unable to manage channel.')],
      });
    }

    if (!bitrate) {
      return channel.edit({ bitrate: 64000 }).then(() => {
        interaction.reply('Set bitrate to default.');
      });
    }
    if (!(bitrate <= 96 && bitrate >= 8)) {
      return interaction.reply({
        embeds: [
          ErrorEmbed(
            'Bitrate (in kbps) should be greater than or equal to 4 or less than or equal to 96.'
          ),
        ],
      });
    }
    await channel.edit({
      bitrate: bitrate ? bitrate * 1000 : 64000,
    });
    return interaction.reply(
      `<#${channel.id}> bitrate changed to ${bitrate ?? 'default'}kbps.`
    );
  });

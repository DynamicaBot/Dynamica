import help from '@/help/limit';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import { ErrorEmbed } from '@utils/discordEmbeds';

export default new Command()
  .setPreconditions([checkCreator, checkSecondary])
  .setCommandData(
    new SlashCommandBuilder()
      .setName('limit')
      .setDescription(
        'Edit the max number of people allowed in the current channel'
      )
      .addIntegerOption((option) =>
        option
          .setDescription(
            'The maximum number of people that are allowed to join the channel.'
          )
          .setName('number')
          .setRequired(true)
      )
  )
  .setHelp(help)
  .setResponse(async (interaction) => {
    const userLimit = interaction.options.getInteger('number', true);

    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      return interaction.reply({
        embeds: [ErrorEmbed(`Cannot edit <#${channel.id}>.`)],
      });
    }
    channel.edit({ userLimit });
    return interaction.reply(`<#${channel.id}> limit changed to ${userLimit}.`);
  });

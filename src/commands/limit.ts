import help from '@/help/limit';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import { ErrorEmbed } from '@utils/discordEmbeds';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
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
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const userLimit = interaction.options.getInteger('number', true);

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const { channel } = guildMember.voice;

  if (!channel.manageable) {
    interaction.reply({
      embeds: [ErrorEmbed(`Cannot edit <#${channel.id}>.`)],
    });
    return;
  }
  channel.edit({ userLimit });
  interaction.reply(`<#${channel.id}> limit changed to ${userLimit}.`);
};

export const limit = new Command({
  preconditions: [checkCreator, checkSecondary],
  data,
  help,
  response,
});

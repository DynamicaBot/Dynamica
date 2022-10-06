import help from '@/help/transfer';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkCreator from '@preconditions/creator';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('transfer')
  .setDMPermission(false)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription('Transfer ownership of secondary channel to another person')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The person to transfer ownership to.')
      .setRequired(true)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const user = interaction.options.getUser('user', true);

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const { channelId } = guildMember.voice;

  const secondaryChannel = DynamicaSecondary.get(channelId);
  if (secondaryChannel) {
    await secondaryChannel.changeOwner(user);
    interaction.reply(`Ownership of <#${channelId}> channel to <@${user.id}>.`);
  } else {
    interaction.reply('Not a valid secondary channel.');
  }
};

export const transfer = new Command({
  preconditions: [checkCreator],
  data,
  response,
  help,
});

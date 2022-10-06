import help from '@/help/allyourbase';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import checkManager from '@preconditions/manager';
import checkSecondary from '@preconditions/secondary';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('allyourbase')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .setDescription(
    'If you are an admin you become the owner of the channel you are in.'
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const { channelId } = guildMember.voice;

  const secondaryChannel = DynamicaSecondary.get(channelId);

  if (secondaryChannel) {
    await secondaryChannel.changeOwner(interaction.user);
    await interaction.reply(
      `Owner of <#${channelId}> changed to <@${guildMember.user.id}>`
    );
  } else {
    await interaction.reply('Must be a valid secondary channel.');
  }
};

export const allyourbase = new Command({
  preconditions: [checkManager, checkSecondary],
  help,
  data,
  response,
});

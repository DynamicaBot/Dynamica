import help from '@/help/lock';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('lock')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDescription('Lock a channel to a certain role or user.');

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  if (!interaction.guild?.members) return;

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const channelId = guildMember?.voice.channelId;

  const dynamicaSecondary = await new DynamicaSecondary(
    interaction.client,
    channelId
  ).fetch();

  if (dynamicaSecondary) {
    await dynamicaSecondary.lock();
    await interaction.reply({
      ephemeral: true,
      content:
        'Use `/permission add` to allow people to access the channels. Or, `/permission remove` to remove people.',
    });
  } else {
    interaction.reply({
      ephemeral: true,
      content: "This isn't a dynamica channel.",
    });
  }
};

export const lock = new Command({
  preconditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data,
  response,
  help,
});

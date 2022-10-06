import help from '@/help/create';
import Command from '@classes/Command';
import DynamicaPrimary from '@classes/Primary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildChannel,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('create')
  .setDescription('Create a primary channel.')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption((option) =>
    option
      .addChannelTypes(4)
      .setName('section')
      .setDescription(
        'A section that the voice channel should be created under.'
      )
      .setRequired(false)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const section = interaction.options.getChannel(
    'section'
  ) as GuildChannel | null;

  const newPrimary = await DynamicaPrimary.initialise(
    interaction.guild,
    interaction.user,
    section
  );

  interaction.reply(
    `New voice channel <#${newPrimary.id}> successfully created.`
  );
};

export const create = new Command({
  preconditions: [checkManager],
  help,
  response,
  data,
});

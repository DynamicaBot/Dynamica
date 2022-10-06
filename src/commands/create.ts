import help from '@/help/create';
import Command from '@classes/command';
import DynamicaPrimary from '@classes/primary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildChannel,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('create')
  .setDefaultMemberPermissions('0')
  .setDescription('Create a primary channel.')
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

  const newPrimary = new DynamicaPrimary(interaction.client);
  await newPrimary.create(interaction.guild, interaction.user, section);

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

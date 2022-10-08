import { Command } from '@/classes/Command';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaPrimary from '@classes/Primary';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildChannel,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';

export class CreateCommand extends Command {
  constructor() {
    super('create');
  }

  data = new SlashCommandBuilder()
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

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const section = interaction.options.getChannel(
      'section'
    ) as GuildChannel | null;
    if (!(interaction.member instanceof GuildMember)) return;

    const newPrimary = await DynamicaPrimary.initialise(
      interaction.guild,
      interaction.member,
      section
    );

    interaction.reply(
      `New voice channel <#${newPrimary.id}> successfully created.`
    );

    this.publish({
      ...interactionDetails(interaction),
    });
  };
}

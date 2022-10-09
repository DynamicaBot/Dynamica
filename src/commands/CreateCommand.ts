import Command from '@/classes/Command';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import DynamicaPrimary from '@classes/Primary';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  GuildChannel,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class CreateCommand extends Command {
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

    interaction.reply({
      embeds: [
        SuccessEmbed(
          `New voice channel ${channelMention(
            newPrimary.id
          )} successfully created.`
        ),
      ],
    });
  };
}

import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  GuildChannel,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';
import Primaries from '@/classes/Primaries';

@Service({ id: CommandToken, multiple: true })
export default class CreateCommand extends Command {
  constructor(private logger: Logger, private primaries: Primaries) {
    super('create');
  }

  conditions: Condition[] = [];

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

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const section = interaction.options.getChannel(
      'section'
    ) as GuildChannel | null;
    if (!(interaction.member instanceof GuildMember)) return;

    const newPrimary = await this.primaries.initialise(
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

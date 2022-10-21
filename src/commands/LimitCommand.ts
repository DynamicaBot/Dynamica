import Command, { CommandToken } from '@/classes/Command';
import Logger from '@/services/Logger';
import creatorCheck from '@/preconditions/creator';
import secondaryCheck from '@/preconditions/secondary';
import { ErrorEmbed, SuccessEmbed } from '@/utils/discordEmbeds';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class LimitCommand extends Command {
  constructor(private logger: Logger) {
    super('limit');
  }

  name = 'limit';

  conditions = [creatorCheck, secondaryCheck];

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const userLimit = interaction.options.getInteger('number', true);
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      interaction.reply({
        embeds: [ErrorEmbed(`Cannot edit ${channelMention(channel.id)}.`)],
      });
      return;
    }
    await channel.edit({ userLimit });
    interaction.reply({
      embeds: [
        SuccessEmbed(
          `${channelMention(channel.id)} limit changed to ${inlineCode(
            userLimit.toString()
          )}.`
        ),
      ],
    });
  };

  data = new SlashCommandBuilder()
    .setName('limit')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
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
}

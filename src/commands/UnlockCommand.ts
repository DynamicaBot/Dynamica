import Command, { CommandToken } from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import creatorCheck from '@/preconditions/creator';
import Logger from '@/services/Logger';
import { SuccessEmbed } from '@utils/discordEmbeds';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class UnlockCommand implements Command {
  constructor(private logger: Logger, private secondaries: Secondaries) {}

  name = 'unlock';

  conditions = [creatorCheck];

  data = new SlashCommandBuilder()
    .setName('unlock')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Remove any existing locks on locked secondary channels.');

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channelId } = guildMember.voice;

    const dynamicaSecondary = this.secondaries.get(channelId);

    await dynamicaSecondary.unlock();
    await interaction.reply({
      embeds: [SuccessEmbed(`Removed lock on ${channelMention(channelId)}.`)],
    });
  };
}

import Command, { CommandToken } from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import secondaryCheck from '@/preconditions/secondary';
import Logger from '@/services/Logger';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class AllyourbaseCommand implements Command {
  constructor(private logger: Logger, private secondaries: Secondaries) {}

  name = 'allyourbase';

  conditions = [secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('allyourbase')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .setDescription(
      'If you are an admin you become the owner of the channel you are in.'
    );

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channelId } = guildMember.voice;

    const secondaryChannel = this.secondaries.get(channelId);

    if (secondaryChannel) {
      await secondaryChannel.changeOwner(interaction.user);
      await interaction.reply(
        `Owner of <#${channelId}> changed to <@${guildMember.user.id}>`
      );
    } else {
      await interaction.reply('Must be a valid secondary channel.');
    }
  };
}

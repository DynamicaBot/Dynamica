import { secondaryCheck } from '@/preconditions/secondary';
import { interactionDetails } from '@/utils/mqtt';
import { Command } from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export class AllyourbaseCommand extends Command {
  constructor() {
    super('allyourbase');
  }

  conditions = [secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('allyourbase')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .setDescription(
      'If you are an admin you become the owner of the channel you are in.'
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
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

      this.publish({
        ...interactionDetails(interaction),
      });
    } else {
      await interaction.reply('Must be a valid secondary channel.');
    }
  };
}

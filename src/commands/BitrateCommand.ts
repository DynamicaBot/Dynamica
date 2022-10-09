import Command from '@/classes/Command';
import creatorCheck from '@/preconditions/creator';
import secondaryCheck from '@/preconditions/secondary';
import interactionDetails from '@/utils/mqtt';

import { ErrorEmbed, SuccessEmbed } from '@utils/discordEmbeds';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class BitrateCommand extends Command {
  constructor() {
    super('bitrate');
  }

  conditions = [creatorCheck, secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('bitrate')
    .setDescription('Edit the bitrate of the current channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setDescription('The bitrate to set the channel to.')
        .setName('bitrate')
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const bitrate = interaction.options.getInteger('bitrate');
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      interaction.reply({
        embeds: [ErrorEmbed('Unable to manage channel.')],
      });
      return;
    }

    if (!bitrate) {
      channel.edit({ bitrate: 64000 }).then(() => {
        interaction.reply({
          embeds: [SuccessEmbed('Set bitrate to default.')],
        });
      });

      this.publish({
        ...interactionDetails(interaction),
      });
      return;
    }
    try {
      await channel.edit({
        bitrate: bitrate ? bitrate * 1000 : 64000,
      });
      interaction.reply({
        embeds: [
          SuccessEmbed(
            `${channelMention(channel.id)} bitrate changed to ${bitrate} kbps.`
          ),
        ],
      });

      this.publish({
        ...interactionDetails(interaction),
      });
    } catch (error) {
      interaction.reply({
        embeds: [
          ErrorEmbed(
            'Make sure that the bitrate is within the rang you have access to (kBps) e.g. 64 for 64000bps'
          ),
        ],
      });
    }
  };
}

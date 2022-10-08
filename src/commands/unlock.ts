import { Command } from '@/classes/Command';
import { MQTT } from '@/classes/MQTT';
import { creatorCheck } from '@/preconditions/creator';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaSecondary from '@classes/Secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ErrorEmbed } from '@utils/discordEmbeds';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

export class UnlockCommand extends Command {
  constructor() {
    super('unlock');
  }

  conditions = [creatorCheck];

  data = new SlashCommandBuilder()
    .setName('unlock')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Remove any existing locks on locked secondary channels.');

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );
    const mqtt = MQTT.getInstance();

    const { channelId } = guildMember.voice;

    const dynamicaSecondary = DynamicaSecondary.get(channelId);

    if (dynamicaSecondary) {
      await dynamicaSecondary.unlock(interaction.client);
      await interaction.reply(`Removed lock on <#${channelId}>`);
      mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
        channel: channelId,
        ...interactionDetails(interaction),
      });
    } else {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed('Not a valid Dynamica channel.')],
      });
    }
  };
}

import { MQTT } from '@/classes/MQTT';
import help from '@/help/lock';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('lock')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDescription('Lock a channel to a certain role or user.');

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const mqtt = MQTT.getInstance();

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const channelId = guildMember?.voice.channelId;

  const dynamicaSecondary = DynamicaSecondary.get(channelId);

  if (dynamicaSecondary) {
    await dynamicaSecondary.lock(interaction.client);
    await interaction.reply({
      ephemeral: true,
      content:
        'Use `/permission add` to allow people to access the channels. Or, `/permission remove` to remove people.',
    });
    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      channel: dynamicaSecondary.id,
      ...interactionDetails(interaction),
    });
  } else {
    interaction.reply({
      ephemeral: true,
      content: "This isn't a dynamica channel.",
    });
  }
};

export const lock = new Command({
  preconditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data,
  response,
  help,
});

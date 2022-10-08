import { MQTT } from '@/classes/MQTT';
import help from '@/help/name';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import checkSecondary from '@preconditions/secondary';
import logger from '@utils/logger';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('name')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDescription('Edit the name of the current channel.')
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('The new name of the channel (can be a template).')
      .setRequired(true)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const name = interaction.options.getString('name');
  const mqtt = MQTT.getInstance();
  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const channel = guildMember?.voice.channel;

  await db.secondary.update({ where: { id: channel.id }, data: { name } });
  logger.info(`${channel.id} name changed.`);

  await DynamicaSecondary.get(channel.id).update(interaction.client);

  interaction.reply(`Channel name changed to \`${name}\`.`);
  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    channel: channel.id,
    name,
    ...interactionDetails(interaction),
  });
};

export const name = new Command({
  preconditions: [checkManager, checkSecondary],
  data,
  response,
  help,
});

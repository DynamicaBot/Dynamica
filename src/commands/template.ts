import { MQTT } from '@/classes/MQTT';
import help from '@/help/template';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('template')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDescription('Edit the template for all secondary channels.')
  .addStringOption((option) =>
    option
      .setAutocomplete(true)
      .setName('channel')
      .setDescription('The channel to change the template for.')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('template')
      .setDescription('The new template for all secondary channels.')
      .setRequired(true)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const name = interaction.options.getString('template', true);
  const channel = interaction.options.getString('channel', true);

  const primary = await db.primary.update({
    where: { id: channel },
    data: { template: name },
    include: { secondaries: true },
  });

  primary.secondaries.forEach(async (secondary) => {
    const dynamicaSecondary = DynamicaSecondary.get(secondary.id);

    dynamicaSecondary.update(interaction.client);
  });

  interaction.reply(`Template changed to \`${name}\`.`);
  const mqtt = MQTT.getInstance();
  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    name,
    ...interactionDetails(interaction),
  });
};

export const template = new Command({
  data,
  response,
  help,
  preconditions: [checkManager],
});

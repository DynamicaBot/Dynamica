import { MQTT } from '@/classes/MQTT';
import help from '@/help/allowjoin';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import DynamicaGuild from '@classes/Guild';
import checkAdminPermissions from '@preconditions/admin';
import checkManager from '@preconditions/manager';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('allowjoin')
  // .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDescription('Allow users to request to join a locked channel.')
  .addBooleanOption((option) =>
    option
      .setName('state')
      .setDescription('Whether to enable or disable join requests.')
      .setRequired(true)
  );

const response = async (interaction) => {
  const state = interaction.options.getBoolean('state', true);
  const guild = DynamicaGuild.get(interaction.guildId);
  guild.setAllowJoin(state);
  interaction.reply(`${state ? 'Enabled' : 'Disabled'} Join Requests`);
  const mqtt = MQTT.getInstance();
  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    ...interactionDetails(interaction),
  });
};

export const allowjoin = new Command({
  preconditions: [checkManager, checkAdminPermissions],
  data,
  response,
  help,
});

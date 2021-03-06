import help from '@/help/allowjoin';
import Command from '@classes/command';
import DynamicaGuild from '@classes/guild';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkManager from '@preconditions/manager';

const data = new SlashCommandBuilder()
  .setName('allowjoin')
  .setDefaultMemberPermissions('0')
  .setDescription('Allow users to request to join a locked channel.')
  .addBooleanOption((option) =>
    option
      .setName('state')
      .setDescription('Whether to enable or disable join requests.')
      .setRequired(true)
  );

const response = async (interaction) => {
  const state = interaction.options.getBoolean('state', true);
  const guild = await new DynamicaGuild(
    interaction.client,
    interaction.guildId
  ).fetch();
  guild.setAllowJoin(state);
  return interaction.reply(`${state ? 'Enabled' : 'Disabled'} Join Requests`);
};

export const allowjoin = new Command({
  preconditions: [checkManager, checkAdminPermissions],
  data,
  response,
  help,
});

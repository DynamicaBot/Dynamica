import { Command } from '@/classes/Command';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaGuild from '@classes/Guild';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export class AllowjoinCommand extends Command {
  constructor() {
    super('allowjoin');
  }

  data = new SlashCommandBuilder()
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

  response = async (interaction) => {
    const state = interaction.options.getBoolean('state', true);
    const guild = DynamicaGuild.get(interaction.guildId);
    guild.setAllowJoin(state);
    interaction.reply(`${state ? 'Enabled' : 'Disabled'} Join Requests`);

    this.publish({
      ...interactionDetails(interaction),
    });
  };
}

import Command from '@/classes/Command';
import Guilds from '@/classes/Guilds';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default class AllowjoinCommand extends Command {
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

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction) => {
    const state = interaction.options.getBoolean('state', true);
    const guild = Guilds.get(interaction.guildId);
    guild.setAllowJoin(state);
    interaction.reply({
      embeds: [SuccessEmbed(`${state ? 'Enabled' : 'Disabled'} Join Requests`)],
    });
  };
}

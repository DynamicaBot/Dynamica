import Command, { CommandToken } from '@/classes/Command';
import Guilds from '@/classes/Guilds';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/utils/logger';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class AllowjoinCommand implements Command {
  constructor(private logger: Logger, private guilds: Guilds) {}

  name: string = 'allowjoin';

  conditions = [];

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
    const guild = this.guilds.get(interaction.guildId);
    guild.setAllowJoin(state);
    interaction.reply({
      embeds: [SuccessEmbed(`${state ? 'Enabled' : 'Disabled'} Join Requests`)],
    });
  };
}
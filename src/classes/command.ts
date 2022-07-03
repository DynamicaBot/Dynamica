import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import {
  ApplicationCommandPermissionData,
  CommandInteraction,
  Guild,
} from 'discord.js';
import Condition from './condition';
import Help from './help';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

interface Props {
  data: SlashCommandBuilderTypes;
  preconditions?: Condition[];
  help?: Help;
  response: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * The command class for defining new Dynamica commands.
 */
export default class Command {
  public static commands: Command[];

  conditions?: Condition[];

  help?: Help;

  data: SlashCommandBuilderTypes;

  response: (interaction: CommandInteraction) => Promise<void>;

  constructor({
    data,
    preconditions: conditions = [],
    help = new Help('', undefined),
    response = async (interaction: CommandInteraction) => {},
  }: Props) {
    this.conditions = conditions;
    this.help = help;
    this.data = data;
    this.response = response;
  }

  /**
   * Updates the permissions of a slash command.
   * @param guild The guild to update the permissions for.
   * @param permissions The permissions to set for the command.
   */
  async updateGuildPermissions(
    guild: Guild,
    permissions: ApplicationCommandPermissionData[]
  ) {
    const guildCommands = await guild.commands.fetch();
    guildCommands.forEach((command) => {
      if (command.name === this.data.name) {
        command.permissions.set({ permissions });
      }
    });
  }
}

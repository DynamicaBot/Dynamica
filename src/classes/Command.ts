import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import Condition from './Condition';
import Help from './Help';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

interface Props {
  data: SlashCommandBuilderTypes;
  preconditions?: Condition[];
  help?: Help;
  response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
}

/**
 * The command class for defining new Dynamica commands.
 */
export default class Command {
  public static commands: Command[];

  conditions?: Condition[];

  help?: Help;

  data: SlashCommandBuilderTypes;

  response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;

  constructor({
    data,
    preconditions: conditions = [],
    help = new Help('', undefined),
    response = async (
      interaction: ChatInputCommandInteraction<CacheType>
    ) => {},
  }: Props) {
    this.conditions = conditions;
    this.help = help;
    this.data = data;
    this.response = response;
  }
}

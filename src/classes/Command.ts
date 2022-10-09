import signaleLogger from '@/utils/logger';

import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Signale } from 'signale';
import Condition from './Condition';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

/**
 * The command class for defining new Dynamica commands.
 */
export default class Command {
  public name: string;

  public logger: Signale;

  public data: SlashCommandBuilderTypes;

  public conditions: Condition[] = [];

  public response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;

  constructor(name: string) {
    this.logger = signaleLogger.scope('Command', name);
    this.name = name;
  }
}

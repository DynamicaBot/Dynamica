import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Token } from 'typedi';
import Condition from './Condition';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export default interface Command {
  name: string;

  data: SlashCommandBuilderTypes;

  conditions: Condition[];

  response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
}

export const CommandToken = new Token<Command>('commands');

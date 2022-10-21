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

export default abstract class Command {
  constructor(public name: string) {}

  abstract data: SlashCommandBuilderTypes;

  abstract conditions: Condition[];

  abstract response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
}

export const CommandToken = new Token<Command>('commands');

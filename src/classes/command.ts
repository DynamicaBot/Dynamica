import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import Condition from './condition';
import Help from './help';

/**
 * The command class for defining new Dynamica commands.
 */
export default class Command {
  preconditions: Condition[];

  help: Help;

  public commandData:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  public execute: (interaction: CommandInteraction) => Promise<void>;

  constructor() {
    this.preconditions = [];
    this.help = new Help('', undefined);
  }

  /**
   * Set preconditions.
   * @param preconditions The different preconditions for the command to be run
   */
  setPreconditions(preconditions?) {
    this.preconditions = preconditions;
    return this;
  }

  /**
   * Set the help info for the command.
   * @param short The short command description.
   * @param long The long command description.
   */
  setHelp(help: Help) {
    this.help = help;
    return this;
  }

  /**
   * The command data for deploying discord commands.
   * @param commandData The discord command data.
   */
  setCommandData(
    commandData:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  ) {
    this.commandData = commandData;
    return this;
  }

  /**
   * Set the function to execute
   * @param data The function to execute when the event is recieved and all the preconditions pass.
   */
  setResponse(data: (interaction: CommandInteraction) => Promise<void>) {
    this.execute = data;
    return this;
  }
}

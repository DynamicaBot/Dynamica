import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Check } from "../utils/conditions/index.js";

/**
 * The command class for defining new Dynamica commands.
 */
export default class Command {
  preconditions: Check[];
  helpText: {
    /**
     * Short bot description.
     */
    short: string;
    /**
     * Long bot description.
     */
    long?: string;
  };
  public commandData:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  public execute: (interaction: CommandInteraction) => Promise<void>;

  constructor() {}

  /**
   * Set preconditions.
   * @param preconditions The different preconditions for the command to be run
   */
  setPreconditions(preconditions?: Check[]) {
    this.preconditions = preconditions;
    return this;
  }

  /**
   * Set the help info for the command.
   * @param short The short command description.
   * @param long The long command description.
   */
  setHelpText(short: string, long?: string) {
    this.helpText = { short, long };
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
      | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
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

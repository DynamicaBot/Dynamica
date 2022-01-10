import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Check } from "./utils/conditions";

export interface Command {
  /**
   * Conditions that the command requires to be successful in order to run.
   */
  conditions: Check[];
  /**
   * Help text for the `/help` command.
   */
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
  /**
   * The command's structure.
   */
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  /**
   * The function to be executed if all the conditions have passed.
   */
  execute: (interaction: CommandInteraction) => Promise<void>;
}

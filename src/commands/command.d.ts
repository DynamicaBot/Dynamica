import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Check } from "../lib/checks/check";

interface Command {
  /**
   * Conditions that need to be fulfilled. Commonly permissions checks.
   */
  conditions: Check[];
  /**
   * The structure of the command itself.
   */
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  /**
   * The main function of the command.
   */
  execute: (interaction: CommandInteraction) => Promise<any>;
}

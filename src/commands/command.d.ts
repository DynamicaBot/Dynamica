import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

interface Command {
  /**
   * Conditions that need to be fulfilled.
   */
  conditions: Array<(interaction: CommandInteraction) => Promise<boolean>>;
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

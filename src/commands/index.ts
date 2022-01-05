import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Check } from "../lib/conditions";

export { about } from "./about";
export { alias } from "./alias";
export { allowjoin } from "./allowjoin";
export { allyourbase } from "./allyourbase";
export { avc } from "./avc";
export { bitrate } from "./bitrate";
export { create } from "./create";
export { general } from "./general";
export { help } from "./help";
export { info } from "./info";
export { invite } from "./invite";
export { join } from "./join";
export { limit } from "./limit";
export { lock } from "./lock";
export { name } from "./name";
export { permission } from "./permission";
export { ping } from "./ping";
export { template } from "./template";
export { text } from "./text";
export { transfer } from "./transfer";
export { unlock } from "./unlock";
export { version } from "./version";

/**
 * Command Builder for Dynamica
 */
export class CommandBuilder {
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
  response: (interaction: CommandInteraction) => Promise<any>;

  setConditions(conditions: Check[]) {
    this.conditions = conditions;
    return this;
  }

  /**
   * Set the command data and config
   * @param data DiscordJS Command Builder
   * @returns builder
   */
  setData(
    data:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  ) {
    this.data = data;
    return this;
  }

  /**
   * Set the response to the command
   * @param execute The response to be executed.
   * @returns builder
   */
  setResponse(execute: (interaction: CommandInteraction) => Promise<any>) {
    this.response = execute;
    return this;
  }

  /**
   * Run the command
   * @param interaction DiscordJS Interaction
   * @returns Promise
   */
  run(interaction: CommandInteraction) {
    if (!("conditions" in this)) {
      throw new Error("Conditions is missing");
    }
    if (!("data" in this)) {
      throw new Error("Data is missing");
    }
    if (!("response" in this)) {
      throw new Error("Response is missing");
    }
    return this.response(interaction);
  }
}

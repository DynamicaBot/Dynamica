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

export interface Command {
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

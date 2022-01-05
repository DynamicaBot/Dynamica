import { AutocompleteInteraction } from "discord.js";

export { general } from "./general";
export { help } from "./help";
export { join } from "./join";
export { template } from "./template";

export interface Autocomplete {
  /**
   * The main function of the command.
   */
  execute: (interaction: AutocompleteInteraction) => Promise<any>;
}

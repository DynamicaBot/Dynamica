import { AutocompleteInteraction } from "discord.js";

interface Autocomplete {
  /**
   * The main function of the command.
   */
  execute: (interaction: AutocompleteInteraction) => Promise<any>;
}

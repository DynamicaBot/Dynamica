import { AutocompleteInteraction } from "discord.js";

export interface Autocomplete {
  name: string;
  execute: (interaction: AutocompleteInteraction) => Promise<void>;
}

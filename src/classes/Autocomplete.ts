import { AutocompleteInteraction } from 'discord.js';
import { Token } from 'typedi';
/**
 * The autocomplete discordjs class for ease of use.
 */
export default interface Autocomplete {
  /**
   * The response to an Autocomplete event.
   */
  response: (interaction: AutocompleteInteraction) => Promise<void>;

  name: string;
}

export const AutocompleteToken = new Token<Autocomplete>('autocompletes');

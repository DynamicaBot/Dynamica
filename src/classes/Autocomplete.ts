import { AutocompleteInteraction } from 'discord.js';
import { Token } from 'typedi';
/**
 * The autocomplete discordjs class for ease of use.
 */
export default abstract class Autocomplete {
  constructor(public name: string) {}

  /**
   * The response to an Autocomplete event.
   */
  abstract response: (interaction: AutocompleteInteraction) => Promise<void>;
}

export const AutocompleteToken = new Token<Autocomplete>('autocompletes');

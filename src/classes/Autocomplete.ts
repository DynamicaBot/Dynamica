import signaleLogger from '@utils/logger';
import { AutocompleteInteraction } from 'discord.js';
import { Signale } from 'signale';
/**
 * The autocomplete discordjs class for ease of use.
 */
export default class Autocomplete {
  public logger: Signale;

  /**
   * The response to an Autocomplete event.
   */
  public response: (interaction: AutocompleteInteraction) => Promise<void>;

  constructor(public name: string) {
    this.logger = signaleLogger.scope('Autocomplete', name);
  }
}

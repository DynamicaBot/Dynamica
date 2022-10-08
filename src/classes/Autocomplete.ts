import signaleLogger from '@utils/logger';
import { AutocompleteInteraction } from 'discord.js';
import { Signale } from 'signale';
/**
 * The autocomplete discordjs class for ease of use.
 */
export class Autocomplete {
  public logger: Signale;

  /**
   * The response to an Autocomplete event.
   */
  public response: (interaction: AutocompleteInteraction) => Promise<void>;

  constructor(public name: string) {
    this.logger = signaleLogger.scope('Autocomplete', name);
  }
}

export class Autocompletes {
  public static autocompletes: Record<string, Autocomplete> = {};

  public static register(autocomplete: Autocomplete): void {
    Autocompletes.autocompletes[autocomplete.name] = autocomplete;
  }

  public static get(name: string): Autocomplete | undefined {
    return Autocompletes.autocompletes[name];
  }

  public static has(name: string): boolean {
    return Autocompletes.autocompletes.hasOwnProperty(name);
  }

  static get all(): Autocomplete[] {
    return Object.values(Autocompletes.autocompletes);
  }

  static run = async (interaction: AutocompleteInteraction) => {
    try {
      const autocomplete: Autocomplete = Autocompletes.get(
        interaction.commandName
      )!;
      await autocomplete.response(interaction);
    } catch (error) {
      console.error(error);
    }
  };
}

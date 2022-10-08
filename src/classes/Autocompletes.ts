import { AutocompleteInteraction } from 'discord.js';
import type Autocomplete from './Autocomplete';

export default class Autocompletes {
  public static autocompletes: Record<string, Autocomplete> = {};

  public static register(autocomplete: Autocomplete): void {
    Autocompletes.autocompletes[autocomplete.name] = autocomplete;
  }

  public static get(name: string): Autocomplete | undefined {
    return Autocompletes.autocompletes[name];
  }

  static get all(): Autocomplete[] {
    return Object.values(Autocompletes.autocompletes);
  }

  static run = async (interaction: AutocompleteInteraction) => {
    const autocomplete: Autocomplete = Autocompletes.get(
      interaction.commandName
    )!;
    await autocomplete.response(interaction);
  };
}

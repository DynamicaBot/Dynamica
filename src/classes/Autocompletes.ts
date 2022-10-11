import { AutocompleteInteraction } from 'discord.js';
import { Service } from 'typedi';
import type Autocomplete from './Autocomplete';

@Service()
export default class Autocompletes {
  public autocompletes: Record<string, Autocomplete> = {};

  public register(autocomplete: Autocomplete): void {
    this.autocompletes[autocomplete.name] = autocomplete;
  }

  public get(name: string): Autocomplete | undefined {
    return this.autocompletes[name];
  }

  get all(): Autocomplete[] {
    return Object.values(this.autocompletes);
  }

  run = async (interaction: AutocompleteInteraction) => {
    const autocomplete: Autocomplete = this.get(interaction.commandName)!;
    await autocomplete.response(interaction);
  };
}

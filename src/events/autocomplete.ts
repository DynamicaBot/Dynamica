import { Autocompletes } from '@classes/Autocomplete';
import { Event } from '@classes/Event';
import { CacheType, Interaction } from 'discord.js';

export class AutocompleteEvent extends Event<'interactionCreate'> {
  constructor() {
    super('interactionCreate');
  }

  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    Autocompletes.run(interaction);
  };
}

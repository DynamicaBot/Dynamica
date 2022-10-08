import autocompletes from '@autocompletes';
import Autocomplete from '@classes/Autocomplete';
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
    try {
      const autocomplete: Autocomplete = autocompletes[interaction.commandName];
      autocomplete.response(interaction);
    } catch (error) {
      this.logger.error(error);
    }
  };
}

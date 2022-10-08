import Autocompletes from '@classes/Autocompletes';
import Event from '@classes/Event';
import { CacheType, Interaction } from 'discord.js';

export default class AutocompleteEvent extends Event<'interactionCreate'> {
  constructor() {
    super('interactionCreate');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    Autocompletes.run(interaction);
  };
}

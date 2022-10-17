import Autocompletes from '@/classes/Autocompletes';
import Event, { EventToken } from '@/classes/Event';
import { CacheType, Interaction } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class AutocompleteEvent extends Event<'interactionCreate'> {
  constructor(private autocompletes: Autocompletes) {
    super();
  }

  event = 'interactionCreate' as const;

  once = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    this.autocompletes.run(interaction);
  };
}

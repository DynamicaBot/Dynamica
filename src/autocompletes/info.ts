import { Autocomplete } from '@/classes/Autocomplete';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import { PrimaryAutocomplete } from './primary';
import { SecondaryAutocomplete } from './secondary';

export class InfoAutocomplete extends Autocomplete {
  constructor() {
    super('info');
  }

  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'primary') {
      new PrimaryAutocomplete('info').response(interaction);
    } else if (subcommand === 'secondary') {
      new SecondaryAutocomplete('info').response(interaction);
    }
  };
}

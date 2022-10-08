import Autocomplete from '@/classes/Autocomplete';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import PrimaryAutocomplete from './primary';
import SecondaryAutocomplete from './secondary';

export default class InfoAutocomplete extends Autocomplete {
  constructor() {
    super('info');
  }

  // eslint-disable-next-line class-methods-use-this
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

import Autocomplete, { AutocompleteToken } from '@/classes/Autocomplete';
import Helps from '@/classes/Helps';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import Fuse from 'fuse.js';
import { Service } from 'typedi';

@Service({ id: AutocompleteToken, multiple: true })
export default class HelpAutocomplete implements Autocomplete {
  constructor(private helps: Helps) {}

  name: string = 'help';

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const value = interaction.options.getFocused();
    const helpOptions = this.helps.names;

    const fuse = new Fuse(helpOptions);

    const query = fuse.search(value.toString());

    interaction.respond(
      value.toString()
        ? query
            .map((result) => ({
              name: result.item,
              value: result.item,
            }))
            .slice(0, 24)
        : helpOptions
            ?.map((option) => ({
              name: option,
              value: option,
            }))
            .slice(0, 24)
    );
  };
}

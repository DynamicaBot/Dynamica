import Autocomplete, { AutocompleteToken } from '@/classes/Autocomplete';
import DB from '@/services/DB';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import Fuse from 'fuse.js';
import { Service } from 'typedi';

@Service({ id: AutocompleteToken, multiple: true })
export default class PrimaryAutocomplete extends Autocomplete {
  constructor(private db: DB) {
    super('primary');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const primaries = await this.db.primary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    function matchingPrimary(discordChannel) {
      return primaries.find((primary) => discordChannel.id === primary.id);
    }

    const availablePrimaryChannels = discordChannels.filter(matchingPrimary);
    const options = availablePrimaryChannels.map((channel) => ({
      name: channel.name,
      value: channel.id,
    }));
    const fuse = new Fuse(options, { keys: ['name', 'id'] });
    const query = fuse.search(value.toString());
    interaction.respond(
      value.toString()
        ? query.map((result) => result.item).slice(0, 24)
        : options.slice(0, 24)
    );
  };
}

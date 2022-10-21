import Autocomplete, { AutocompleteToken } from '@/classes/Autocomplete';
import DB from '@/services/DB';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import Fuse from 'fuse.js';
import { Service } from 'typedi';

@Service({ id: AutocompleteToken, multiple: true })
export default class SecondaryAutocomplete extends Autocomplete {
  constructor(private db: DB) {
    super('secondary');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const secondaries = await this.db.secondary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    function matchingSecondary(discordChannel) {
      return secondaries.find(
        (secondary) => discordChannel.id === secondary.id
      );
    }

    const availableSecondaryChannels =
      discordChannels.filter(matchingSecondary);
    const options = availableSecondaryChannels.map((channel) => ({
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

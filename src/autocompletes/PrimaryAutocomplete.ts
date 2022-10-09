import Autocomplete from '@/classes/Autocomplete';
import db from '@db';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import Fuse from 'fuse.js';

export default class PrimaryAutocomplete extends Autocomplete {
  constructor(commandName: string = 'primary') {
    super(commandName);
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const primaries = await db.primary.findMany({
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

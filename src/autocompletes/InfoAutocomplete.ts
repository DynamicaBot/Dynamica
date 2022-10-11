import Autocomplete, { AutocompleteToken } from '@/classes/Autocomplete';
import DB from '@/services/DB';
import { AutocompleteInteraction, CacheType } from 'discord.js';
import Fuse from 'fuse.js';
import { Service } from 'typedi';

@Service({ id: AutocompleteToken, multiple: true })
export default class InfoAutocomplete implements Autocomplete {
  constructor(private db: DB) {}

  name = 'info';

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const { value } = interaction.options.getFocused(true);
    if (subcommand === 'primary') {
      const primaries = await this.db.primary.findMany({
        where: { guildId: interaction.guild.id },
      });

      if (!interaction.guild) return;

      const discordChannels = [...interaction.guild.channels.cache.values()];

      const availablePrimaryChannels = discordChannels.filter((channel) =>
        primaries.find((primary) => channel.id === primary.id)
      );

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
    } else if (subcommand === 'secondary') {
      const secondaries = await this.db.secondary.findMany({
        where: { guildId: interaction.guild.id },
      });

      if (!interaction.guild) return;

      const discordChannels = [...interaction.guild.channels.cache.values()];

      const availableSecondaryChannels = discordChannels.filter((channel) =>
        secondaries.find((primary) => channel.id === primary.id)
      );

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
    }
  };
}

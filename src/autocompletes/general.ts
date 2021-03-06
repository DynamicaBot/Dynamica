import Autocomplete from '@classes/autocomplete';
import db from '@db';
import Fuse from 'fuse.js';

export default new Autocomplete()
  .setName('channel')
  .setResponse(async (interaction) => {
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
  });

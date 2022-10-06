import Autocomplete from '@classes/Autocomplete';
import db from '@db';
import Fuse from 'fuse.js';

export default new Autocomplete()
  .setName('info')
  .setResponse(async (interaction) => {
    const { value, name } = interaction.options.getFocused(true);
    const discordChannels = [...interaction.guild.channels.cache.values()];
    if (name === 'secondarychannel') {
      const secondaries = await db.secondary.findMany({
        where: { guildId: interaction.guildId },
      });

      const availableSecondaryChannels = discordChannels.filter(
        (discordChannel) =>
          secondaries.find((secondary) => discordChannel.id === secondary.id)
      );
      const secondaryOptions = availableSecondaryChannels.map((channel) => ({
        name: channel.name,
        value: channel.id,
      }));
      const secondaryFuse = new Fuse(secondaryOptions, { keys: ['name'] });
      const secondaryQuery = secondaryFuse.search(value.toString());
      // interaction.respond();
      interaction.respond(
        value.toString()
          ? secondaryQuery.map((result) => result.item).slice(0, 24)
          : secondaryOptions.slice(0, 24)
      );
    } else if (name === 'primarychannel') {
      const primaries = await db.primary.findMany({
        where: { guildId: interaction.guildId },
      });

      const availablePrimaryChannels = discordChannels.filter(
        (discordChannel) =>
          primaries.find((secondary) => discordChannel.id === secondary.id)
      );
      const primaryOptions = availablePrimaryChannels.map((channel) => ({
        name: channel.name,
        value: channel.id,
      }));
      const primaryFuse = new Fuse(primaryOptions, { keys: ['name'] });
      const primaryQuery = primaryFuse.search(value.toString());
      // interaction.respond();
      interaction.respond(
        value.toString()
          ? primaryQuery.map((result) => result.item).slice(0, 24)
          : primaryOptions.slice(0, 24)
      );
    }
  });

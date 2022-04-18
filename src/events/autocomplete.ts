import autocompletes from '@autocompletes';
import Autocomplete from '@classes/autocomplete';
import Event from '@classes/event';
import logger from '@utils/logger';

export default new Event<'interactionCreate'>()
  .setOnce(false)
  .setEvent('interactionCreate')
  .setResponse(async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    try {
      const autocomplete: Autocomplete = autocompletes[interaction.commandName];
      autocomplete.response(interaction);
    } catch (error) {
      logger.error(error);
    }
  });

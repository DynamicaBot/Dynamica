import { Interaction } from "discord.js";
import * as autocompletes from "../autocompletes/index.js";
import Autocomplete from "../classes/autocomplete.js";
import Event from "../classes/event.js";
import { logger } from "../utils/logger.js";

export const autocomplete = new Event()
  .setOnce(false)
  .setEvent("interactionCreate")
  .setResponse(async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (!interaction.isAutocomplete()) return;
    try {
      const autocomplete: Autocomplete = autocompletes[interaction.commandName];

      autocomplete.response(interaction);
    } catch (error) {
      logger.error(error);
    }
  });

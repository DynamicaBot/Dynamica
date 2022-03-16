import { Interaction } from "discord.js";
import { Event } from ".";
import { Autocomplete } from "../Autocomplete";
import * as autocompletes from "../autocompletes";
import { logger } from "../utils/logger";

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

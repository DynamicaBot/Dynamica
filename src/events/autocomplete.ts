import { Interaction } from "discord.js";
import { logger } from "..";
import { Autocomplete } from "../Autocomplete";
import * as autocompletes from "../autocompletes";
import { Event } from "../Event";

export const autocomplete: Event = {
  event: "interactionCreate",
  once: false,
  async execute(interaction: Interaction) {
    if (!interaction.isAutocomplete()) return;

    if (!interaction.isAutocomplete()) return;
    try {
      const autocomplete: Autocomplete = autocompletes[interaction.commandName];

      autocomplete.execute(interaction);
    } catch (error) {
      logger.error(error);
    }
  },
};

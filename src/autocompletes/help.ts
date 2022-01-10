import Fuse from "fuse.js";
import { Autocomplete } from "../Autocomplete";
import * as commands from "../commands";

export const help: Autocomplete = {
  name: "help",
  execute: async (interaction) => {
    const value = interaction.options.getFocused();
    const commandValues = Object.values(commands);

    const fuse = new Fuse(
      commandValues?.map(({ data, helpText }) => ({
        name: data.name,
        short: helpText.short,
        long: helpText.long,
      })),
      {
        keys: [
          { name: "name", weight: 3 },
          { name: "short", weight: 2 },
          { name: "long", weight: 1 },
        ],
      }
    );

    const query = fuse.search(value.toString());
    interaction.respond(
      query.map((result) => ({
        name: result.item.name,
        value: result.item.name,
      }))
    );
  },
};

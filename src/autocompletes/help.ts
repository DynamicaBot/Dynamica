import Fuse from "fuse.js";
import { Autocomplete } from ".";
import * as commands from "../commands";

export const help = new Autocomplete()
  .setName("help")
  .setResponse(async (interaction) => {
    const value = interaction.options.getFocused();
    const commandValues = Object.values(commands) as commands.Command[];

    const fuse = new Fuse(
      commandValues?.map(({ commandData, helpText }) => ({
        name: commandData.name,
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
  });

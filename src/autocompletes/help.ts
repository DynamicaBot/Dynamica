import Autocomplete from "@classes/autocomplete";
import Command from "@classes/command";
import * as commands from "@commands";
import Fuse from "fuse.js";

export const help = new Autocomplete()
  .setName("help")
  .setResponse(async (interaction) => {
    const value = interaction.options.getFocused();
    const commandValues = Object.values(commands) as Command[];

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
      !!value.toString()
        ? query
            .map((result) => ({
              name: result.item.name,
              value: result.item.name,
            }))
            .slice(0, 24)
        : commandValues
            ?.map(({ commandData }) => ({
              name: commandData.name,
              value: commandData.name,
            }))
            .slice(0, 24)
    );
  });

import Fuse from "fuse.js";
import { getCommands } from "../lib/getCached";
import type { Autocomplete } from "./";

export const help: Autocomplete = {
  async execute(interaction) {
    const { name, value } = interaction.options.getFocused(true);
    if (name !== "subcommand") return;
    const commands = await getCommands(
      interaction.guild?.commands,
      interaction.client.application?.commands
    );

    const fuse = new Fuse(
      commands?.map(({ name }) => ({
        name,
        value: name,
      })),
      { keys: ["name"] }
    );
    commands?.map(({ name }) => ({
      name,
      value: name,
    }));

    const query = fuse.search(value.toString());

    interaction.respond(query.map((result) => result.item));
  },
};

import Fuse from "fuse.js";
import { getCommands } from "../utils/getCached";

export const help = {
  name: "help",
  execute: async (interaction) => {
    const { value } = interaction.options.getFocused(true);
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

import Autocomplete from "@classes/autocomplete";
import db from "@db";
import Fuse from "fuse.js";

export const alias = new Autocomplete()
  .setName("activity")
  .setResponse(async interaction => {
    const { value } = interaction.options.getFocused(true);
    const aliases = await db.alias.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;
    const options = aliases.map(alias => ({
      name: alias.activity,
      value: alias.id.toString(),
    }));
    const fuse = new Fuse(options, { keys: ["name"] });
    const query = fuse.search(value.toString());
    interaction.respond(
      value.toString()
        ? query.map(result => result.item).slice(0, 24)
        : options.slice(0, 24)
    );
  });

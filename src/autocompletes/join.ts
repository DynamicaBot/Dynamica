import Fuse from "fuse.js";
import { Autocomplete } from "../Autocomplete";
import { db } from "../utils/db";

export const join: Autocomplete = {
  name: "join",
  execute: async (interaction) => {
    const { name, value } = interaction.options.getFocused(true);
    if (name !== "channel") return;
    const secondaries = await db.secondary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availableSecondaryChannels = discordChannels.filter(
      (discordChannel) =>
        secondaries.find((secondary) => discordChannel.id === secondary.id)
    );
    const options = availableSecondaryChannels.map((channel) => ({
      name: channel.name,
      value: channel.id,
    }));
    const fuse = new Fuse(options, { keys: ["name", "id"] });
    const query = fuse.search(value.toString());
    interaction.respond(query.map((result) => result.item));
  },
};

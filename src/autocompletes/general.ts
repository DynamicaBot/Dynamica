import Fuse from "fuse.js";
import { db } from "../lib/prisma";
import { Autocomplete } from "./autocomplete";

export const general: Autocomplete = {
  async execute(interaction) {
    const { name, value } = interaction.options.getFocused(true);
    if (name !== "channel") return;
    const primaries = await db.primary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availablePrimaryChannels = discordChannels.filter((discordChannel) =>
      primaries.find((primary) => discordChannel.id === primary.id)
    );
    const options = availablePrimaryChannels.map((channel) => ({
      name: channel.name,
      value: channel.id,
    }));
    const fuse = new Fuse(options, { keys: ["name", "id"] });
    const query = fuse.search(value.toString());
    interaction.respond(query.map((result) => result.item));
  },
};

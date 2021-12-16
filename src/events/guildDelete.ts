import { debug } from "@lib/colourfulLogger";
import { Guild } from "discord.js";
import { event } from "./event";

export const guildDelete: event = {
  name: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

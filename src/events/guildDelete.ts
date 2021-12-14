import { prisma } from "../lib/prisma";
import { Client, Guild } from "discord.js";
import { debug } from "../lib/colourfulLogger";
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

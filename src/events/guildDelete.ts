import { Guild } from "discord.js";
import { logger } from "../lib/logger";
import { event } from "./event";

export const guildDelete: event = {
  name: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

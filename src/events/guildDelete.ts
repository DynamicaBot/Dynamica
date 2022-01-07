import { Guild } from "discord.js";
import { logger } from "..";
import { Event } from "../Event";

export const guildDelete: Event = {
  event: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

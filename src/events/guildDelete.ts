import { Guild } from "discord.js";
import { Event } from "../Event";
import { db } from "../utils/db";
import { logger } from "../utils/logger";

export const guildDelete: Event = {
  event: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    await db.guild.delete({ where: { id: guild.id } });
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

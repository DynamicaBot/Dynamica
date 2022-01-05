import { Guild } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { Event } from ".";
import { kLogger } from "../tokens";

export const guildDelete: Event = {
  name: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const logger = container.resolve<Signale>(kLogger);
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

import { Guild } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { kLogger } from "../tokens.js";
import { event } from "./event.js";

export const guildDelete: event = {
  name: "guildDelete",
  once: false,
  async execute(guild: Guild) {
    const logger = container.resolve<Signale>(kLogger);
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  },
};

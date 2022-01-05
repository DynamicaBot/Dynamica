import { Guild } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { EventBuilder } from "../lib/builders";
import { kLogger } from "../tokens";

export const guildDelete = new EventBuilder()
  .setName("guildDelete")
  .setOnce(false)
  .setResponse(async (guild: Guild) => {
    const logger = container.resolve<Signale>(kLogger);
    const manager = await guild.channels.cache.get("Dynamica Manager");
    await manager?.delete();
    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  });

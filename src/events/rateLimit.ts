import { RateLimitData } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { EventBuilder } from "../lib/builders";
import { kLogger } from "../tokens";

export const rateLimit = new EventBuilder()
  .setName("rateLimit")
  .setOnce(false)
  .setResponse(async (data: RateLimitData) => {
    const logger = container.resolve<Signale>(kLogger);
    logger.info(data);
  });

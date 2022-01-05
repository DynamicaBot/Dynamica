import { RateLimitData } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { Event } from ".";
import { kLogger } from "../tokens";

export const rateLimit: Event = {
  once: false,
  name: "rateLimit",
  async execute(data: RateLimitData) {
    const logger = container.resolve<Signale>(kLogger);
    logger.info(data);
  },
};

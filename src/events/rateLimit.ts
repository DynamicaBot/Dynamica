import { RateLimitData } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { kLogger } from "../tokens.js";
import { event } from "./event.js";

export const rateLimit: event = {
  once: false,
  name: "rateLimit",
  async execute(data: RateLimitData) {
    const logger = container.resolve<Signale>(kLogger);
    logger.info(data);
  },
};

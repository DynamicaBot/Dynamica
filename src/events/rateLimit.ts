import { RateLimitData } from "discord.js";
import { logger } from "../lib/logger.js";
import { event } from "./event.js";

export const rateLimit: event = {
  once: false,
  name: "rateLimit",
  async execute(data: RateLimitData) {
    logger.info(data);
  },
};

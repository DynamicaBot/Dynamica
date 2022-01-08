import { RateLimitData } from "discord.js";
import { Event } from "../Event";
import { logger } from "../utils/logger";

export const guildCreate: Event = {
  once: false,
  event: "guildCreate",
  async execute(data: RateLimitData) {
    logger.info(data);
  },
};

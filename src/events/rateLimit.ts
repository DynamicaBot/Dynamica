import { RateLimitData } from "discord.js";
import { logger } from "..";
import { Event } from "../Event";

export const guildCreate: Event = {
  once: false,
  event: "guildCreate",
  async execute(data: RateLimitData) {
    logger.info(data);
  },
};

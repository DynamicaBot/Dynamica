import { RateLimitData } from "discord.js";
import { Event } from ".";
import { logger } from "../utils/logger";

export const guildCreate = new Event()
  .setOnce(false)
  .setEvent("guildCreate")
  .setResponse(async (data: RateLimitData) => {
    logger.info(data);
  });

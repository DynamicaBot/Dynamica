import { RateLimitData } from "discord.js";
import Event from "../classes/event.js";
import { logger } from "../utils/logger.js";

export const guildCreate = new Event()
  .setOnce(false)
  .setEvent("guildCreate")
  .setResponse(async (data: RateLimitData) => {
    logger.info(data);
  });

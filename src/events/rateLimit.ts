import Event from '@classes/event';
import logger from '@utils/logger';
import { RateLimitData } from 'discord.js';

export default new Event()
  .setOnce(false)
  .setEvent('guildCreate')
  .setResponse(async (data: RateLimitData) => {
    logger.info(data);
  });

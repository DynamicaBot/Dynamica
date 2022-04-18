import Event from '@classes/event';
import logger from '@utils/logger';

export default new Event<'rateLimit'>()
  .setOnce(false)
  .setEvent('rateLimit')
  .setResponse(async (data) => {
    logger.info(data);
  });

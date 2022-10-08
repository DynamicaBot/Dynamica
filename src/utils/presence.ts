import DynamicaSecondary from '@/classes/Secondary';
import { ActivityType, Client } from 'discord.js';
import logger from './logger';

const updatePresence = async (client: Client<true>) => {
  try {
    const secondaryCount = DynamicaSecondary.count;

    client.user.setActivity({
      type: ActivityType.Watching,
      name: `${secondaryCount} channels`,
      url: 'https://dynamica.dev',
    });
    client.user.client.user.setAFK(!!secondaryCount);
    client.user.setStatus(secondaryCount ? 'online' : 'idle');
  } catch (error) {
    logger.error(error);
  }
};

export default updatePresence;

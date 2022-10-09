import Secondaries from '@/classes/Secondaries';
import { ActivityType, Client } from 'discord.js';
import logger from './logger';

const pl = (n: number) => (n === 1 ? '' : 's');

const updatePresence = async (client: Client<true>) => {
  try {
    const channelCount = Secondaries.count;

    client.user.setActivity({
      type: ActivityType.Watching,
      name: `${channelCount} channel${pl(channelCount)}`,
      url: 'https://dynamica.dev',
    });
    client.user.client.user.setAFK(!!channelCount);
    client.user.setStatus(channelCount ? 'online' : 'idle');
  } catch (error) {
    logger.error(error);
  }
};

export default updatePresence;

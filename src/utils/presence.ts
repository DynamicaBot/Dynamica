import Secondaries from '@/classes/Secondaries';
import { ActivityType, Client } from 'discord.js';
import logger from './logger';

const pl = (n: number) => (n === 1 ? '' : 's');

const updatePresence = async (client: Client<true>) => {
  try {
    const channelCount = Secondaries.count;

    client.user.setPresence({
      afk: !!channelCount,
      status: channelCount ? 'online' : 'idle',
      activities: [
        {
          type: ActivityType.Watching,
          name: `${channelCount} channel${pl(channelCount)}`,
          url: 'https://dynamica.dev',
        },
      ],
    });
  } catch (error) {
    logger.error(error);
  }
};

export default updatePresence;

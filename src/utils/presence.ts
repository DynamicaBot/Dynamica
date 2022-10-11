import Secondaries from '@/classes/Secondaries';
import { ActivityType, Client } from 'discord.js';
import { Container } from 'typedi';
import Logger from './logger';

const pl = (n: number) => (n === 1 ? '' : 's');

const updatePresence = async (client: Client<true>) => {
  const secondaries = Container.get(Secondaries);
  const channelCount = secondaries.count;
  const logger = Container.get(Logger);
  try {
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
    logger.error('Error updating presence', error);
  }
};

export default updatePresence;

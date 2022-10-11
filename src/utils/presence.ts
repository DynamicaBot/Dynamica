import Secondaries from '@/classes/Secondaries';
import Client from '@/services/Client';
import { ActivityType } from 'discord.js';
import { Container } from 'typedi';
import Logger from '../services/Logger';

const pl = (n: number) => (n === 1 ? '' : 's');

const updatePresence = async () => {
  const secondaries = Container.get(Secondaries);
  const channelCount = secondaries.count;
  const logger = Container.get(Logger);
  const client = Container.get(Client);
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

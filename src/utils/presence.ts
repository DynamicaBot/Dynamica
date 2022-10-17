import Client from '@/services/Client';
import DB from '@/services/DB';
import { ActivityType } from 'discord.js';
import { Container } from 'typedi';
import Logger from '../services/Logger';

const pl = (n: number) => (n === 1 ? '' : 's');

const updatePresence = async () => {
  const db = Container.get(DB);
  const secondaryCount = await db.secondary.count();
  const primaryCount = await db.primary.count();

  const logger = Container.get(Logger);
  const client = Container.get(Client);

  const channelCount = secondaryCount + primaryCount;
  const name = `${channelCount} channel${pl(channelCount)}`;
  try {
    client.user.setPresence({
      afk: !!channelCount,
      status: channelCount ? 'online' : 'idle',
      activities: [
        {
          type: ActivityType.Watching,
          name,
          url: 'https://dynamica.dev',
        },
      ],
    });
  } catch (error) {
    logger.error('Error updating presence', error);
  }
};

export default updatePresence;

import db from '@db';
import logger from '@utils/logger';
import { ActivityType, Client } from 'discord.js';

/**
 * Refresh Channel Activity Count
 */
const updateActivityCount = (client: Client) =>
  db.secondary
    .count()
    .then((count) => {
      client.user.setPresence({
        status: count ? 'online' : 'idle',
        afk: !!count,
        activities: [
          {
            type: ActivityType.Watching,
            name: `${count} ${count === 1 ? 'channel' : 'channels'}.`,
          },
        ],
      });
    })
    .catch((error) => logger.error(error));

export default updateActivityCount;

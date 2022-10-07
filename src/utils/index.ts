import { MQTT } from '@/classes/MQTT';
import db from '@db';
import logger from '@utils/logger';
import { ActivityType, Client, version } from 'discord.js';

/**
 * Refresh Channel Activity Count
 */
const updateActivityCount = async (client: Client) => {
  try {
    const secondaryCount = await db.secondary.count();
    const primaryCount = await db.primary.count();
    const aliasCount = await db.alias.count();
    const guildCount = client.guilds.cache.size;
    client.user.setActivity({
      type: ActivityType.Watching,
      name: `${secondaryCount} channels`,
      url: 'https://dynamica.dev',
    });
    client.user.client.user.setAFK(!!secondaryCount);
    client.user.setStatus(secondaryCount ? 'online' : 'idle');
    const mqtt = MQTT.getInstance();
    mqtt?.publish('dynamica/status', {
      readyAt: new Date(client.readyTimestamp).toISOString(),
      time: new Date().toISOString(),
      count: {
        secondary: secondaryCount,
        primary: primaryCount,
        alias: aliasCount,
        guild: guildCount,
      },
      version: {
        name: process.env.VERSION,
        discord: version,
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export default updateActivityCount;

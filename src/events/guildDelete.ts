import Event from '@classes/event';
import db from '@db';
import logger from '@utils/logger';
import { Guild } from 'discord.js';

export default new Event()
  .setOnce(false)
  .setEvent('guildDelete')
  .setResponse(async (guild: Guild) => {
    const manager = await guild.channels.cache.get('Dynamica Manager');
    try {
      await manager?.delete();
    } catch (error) {
      logger.error(error);
    }
    try {
      await db.guild.delete({ where: { id: guild.id } });
    } catch (error) {
      logger.error(error);
    }

    logger.debug(`Left guild ${guild.id} named: ${guild.name}`);
  });

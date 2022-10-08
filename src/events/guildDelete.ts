import { MQTT } from '@/classes/MQTT';
import Event from '@classes/Event';
import db from '@db';
import logger from '@utils/logger';

export default new Event<'guildDelete'>()
  .setOnce(false)
  .setEvent('guildDelete')
  .setResponse(async (guild) => {
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
    const mqtt = MQTT.getInstance();
    mqtt?.publish('dynamica/event/leave', {
      guild: {
        id: guild.id,
        name: guild.name,
      },
    });
  });

import { MQTT } from '@/classes/MQTT';
import DynamicaSecondary from '@/classes/Secondary';
import Event from '@classes/Event';
import DynamicaPrimary from '@classes/Primary';
import db from '@db';
import updateActivityCount from '@utils';
import logger from '@utils/logger';
import { DiscordAPIError } from 'discord.js';

export default new Event<'ready'>()
  .setOnce(true)
  .setEvent('ready')
  .setResponse(async (client) => {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    const mqtt = MQTT.getInstance();

    try {
      const secondaries = await db.secondary.findMany();
      const primaries = await db.primary.findMany();

      primaries.forEach(async (element) => {
        try {
          const guild = await client.guilds.fetch(element.guildId);
          await guild.channels.fetch(element.id);
          const existingPrimary = new DynamicaPrimary(
            element.id,
            element.guildId
          );
          await existingPrimary.update(client, guild);
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            if (error.code === 10003) {
              logger.debug(
                `Primary channel (${element.id}) was already deleted.`
              );
              await db.primary.delete({ where: { id: element.id } });
              DynamicaPrimary.remove(element.id);
            } else {
              logger.error(error);
            }
          }
        }
      });

      secondaries.forEach(async (element) => {
        try {
          const guild = await client.guilds.fetch(element.guildId);
          await guild.channels.fetch(element.id);
          const existingSecondary = new DynamicaSecondary(
            element.id,
            element.guildId,
            element.primaryId
          );
          await existingSecondary.update(client);
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            if (error.code === 10003) {
              logger.debug(
                `Secondary channel (${element.id}) was already deleted.`
              );
              await db.secondary.delete({ where: { id: element.id } });
              DynamicaSecondary.remove(element.id);
            } else {
              logger.error(error);
            }
          }
        }
      });
      mqtt?.publish('dynamica/presence', {
        ready: client.isReady,
        guilds: await (await client.guilds.fetch()).toJSON(),
        activePrimaries: primaries.length,
        activeSecondaries: secondaries.length,
      });
    } catch (error) {
      logger.error(error);
    } finally {
      updateActivityCount(client);
    }
  });

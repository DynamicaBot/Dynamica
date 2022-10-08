import DynamicaAlias from '@/classes/Alias';
import DynamicaGuild from '@/classes/Guild';
import { MQTT } from '@/classes/MQTT';
import DynamicaSecondary from '@/classes/Secondary';
import { updatePresence } from '@/utils';
import Event from '@classes/Event';
import DynamicaPrimary from '@classes/Primary';
import db from '@db';
import logger from '@utils/logger';
import { DiscordAPIError } from 'discord.js';

export default new Event<'ready'>()
  .setOnce(true)
  .setEvent('ready')
  .setResponse(async (client) => {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    const mqtt = MQTT.getInstance();

    try {
      logger.time('ready');
      const secondaries = await db.secondary.findMany();
      const primaries = await db.primary.findMany();
      const aliases = await db.alias.findMany();
      const guilds = await db.guild.findMany();

      await Promise.all(
        primaries.map(async (element) => {
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
        })
      );
      logger.info(`Loaded ${DynamicaPrimary.count} primary channels`);

      await Promise.all(
        secondaries.map(async (element) => {
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
        })
      );
      logger.info(`Loaded ${DynamicaSecondary.count} secondary channels`);

      await Promise.all(
        aliases.map(async (element) => {
          new DynamicaAlias(element.guildId, element.id);
        })
      );
      logger.info(`Loaded ${DynamicaAlias.count} aliases`);

      await Promise.all(
        guilds.map(async (element) => {
          try {
            const guild = await client.guilds.fetch(element.id);
            new DynamicaGuild(guild.id);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              await db.guild.delete({ where: { id: element.id } });
              logger.error(error);
            }
          }
        })
      );
      logger.info(`Loaded ${DynamicaGuild.count} guilds`);

      mqtt?.publish('dynamica/presence', {
        ready: client.readyAt,
      });

      logger.info('Loaded all data');
      logger.timeEnd('ready');
      updatePresence();
    } catch (error) {
      logger.error(error);
    }
  });

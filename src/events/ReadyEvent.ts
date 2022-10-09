import DynamicaAlias from '@/classes/Alias';
import Aliases from '@/classes/Aliases';
import DynamicaGuild from '@/classes/Guild';
import Guilds from '@/classes/Guilds';
import MQTT from '@/classes/MQTT';
import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import DynamicaSecondary from '@/classes/Secondary';
import updatePresence from '@/utils/presence';
// import { updatePresence } from '@/utils';
import Event from '@classes/Event';
import DynamicaPrimary from '@classes/Primary';
import db from '@db';
import { Client, DiscordAPIError } from 'discord.js';

export default class ReadyEvent extends Event<'ready'> {
  constructor() {
    super('ready');
  }

  once = true;

  public response: (client: Client<true>) => void | Promise<void> = async (
    client
  ) => {
    this.logger.info(`Ready! Logged in as ${client.user?.tag}`);
    const mqtt = MQTT.getInstance();

    try {
      this.logger.time('ready');
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
            Primaries.add(existingPrimary);
            await existingPrimary.update(client);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              if (error.code === 10003) {
                this.logger.debug(
                  `Primary channel (${element.id}) was already deleted.`
                );
                await db.primary.delete({ where: { id: element.id } });
                Primaries.remove(element.id);
              } else {
                this.logger.error(error);
              }
            }
          }
        })
      );
      this.logger.info(`Loaded ${Primaries.count} primary channels`);

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
            Secondaries.add(existingSecondary);
            await existingSecondary.update(client);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              if (error.code === 10003) {
                this.logger.debug(
                  `Secondary channel (${element.id}) was already deleted.`
                );
                await db.secondary.delete({ where: { id: element.id } });
                Secondaries.remove(element.id);
                // updatePresence(client);
              } else {
                this.logger.error(error);
              }
            }
          }
        })
      );
      this.logger.info(`Loaded ${Secondaries.count} secondary channels`);

      await Promise.all(
        aliases.map(async (element) => {
          const newAlias = new DynamicaAlias(element.guildId, element.activity);
          Aliases.add(newAlias);
        })
      );
      this.logger.info(`Loaded ${Aliases.count} aliases`);

      await Promise.all(
        guilds.map(async (element) => {
          try {
            const guild = await client.guilds.fetch(element.id);
            const newGuild = new DynamicaGuild(guild.id);
            Guilds.add(newGuild);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              await db.guild.delete({ where: { id: element.id } });
              this.logger.error(error);
            }
          }
        })
      );
      this.logger.info(`Loaded ${Guilds.count} guilds`);

      mqtt?.publish('dynamica/presence', client.readyAt.toISOString());

      this.logger.info('Loaded all data');
      this.logger.timeEnd('ready');
      updatePresence(client);
    } catch (error) {
      this.logger.error(error);
    }
  };
}

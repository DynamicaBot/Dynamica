import Aliases from '@/classes/Aliases';
import AliasFactory from '@/classes/AliasFactory';
import GuildFactory from '@/classes/GuildFactory';
import Guilds from '@/classes/Guilds';
import MQTT from '@/classes/MQTT';
import Primaries from '@/classes/Primaries';
import PrimaryFactory from '@/classes/PrimaryFactory';
import Secondaries from '@/classes/Secondaries';
import SecondaryFactory from '@/classes/SecondaryFactory';
import Logger from '@/services/Logger';
import updatePresence from '@/utils/presence';
// import { updatePresence } from '@/utils';
import Event, { EventToken } from '@classes/Event';
import DB from '@/services/DB';
import { Client, DiscordAPIError } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class ReadyEvent implements Event<'ready'> {
  constructor(
    private logger: Logger,
    private mqtt: MQTT,
    private secondaries: Secondaries,
    private primaries: Primaries,
    private aliases: Aliases,
    private guilds: Guilds,
    private db: DB,
    private primaryFactory: PrimaryFactory,
    private secondaryFactory: SecondaryFactory,
    private guildFactory: GuildFactory,
    private aliasFactory: AliasFactory
  ) {}

  event: 'ready' = 'ready';

  once = true;

  public response: (client: Client<true>) => void | Promise<void> = async (
    client
  ) => {
    this.logger.info(`Ready! Logged in as ${client.user?.tag}`);

    try {
      this.logger.time('ready');
      const secondaries = await this.db.secondary.findMany();
      const primaries = await this.db.primary.findMany();
      const aliases = await this.db.alias.findMany();
      const guilds = await this.db.guild.findMany();

      await Promise.all(
        primaries.map(async (element) => {
          try {
            const guild = await client.guilds.fetch(element.guildId);
            await guild.channels.fetch(element.id);
            const existingPrimary = this.primaryFactory.create(
              element.id,
              element.guildId
            );
            this.primaries.add(existingPrimary);
            await existingPrimary.update(client);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              if (error.code === 10003) {
                this.logger.debug(
                  `Primary channel (${element.id}) was already deleted.`
                );
                await this.db.primary.delete({ where: { id: element.id } });
                this.primaries.remove(element.id);
              } else {
                this.logger.error(error);
              }
            }
          }
        })
      );
      this.logger.info(`Loaded ${this.primaries.count} primary channels`);

      await Promise.all(
        secondaries.map(async (element) => {
          try {
            const guild = await client.guilds.fetch(element.guildId);
            await guild.channels.fetch(element.id);
            const existingSecondary = this.secondaryFactory.create(
              element.id,
              element.guildId,
              element.primaryId
            );
            this.secondaries.add(existingSecondary);
            await existingSecondary.update(client);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              if (error.code === 10003) {
                this.logger.debug(
                  `Secondary channel (${element.id}) was already deleted.`
                );
                await this.db.secondary.delete({ where: { id: element.id } });
                this.secondaries.remove(element.id);
                // updatePresence(client);
              } else {
                this.logger.error(error);
              }
            }
          }
        })
      );
      this.logger.info(`Loaded ${this.secondaries.count} secondary channels`);

      await Promise.all(
        aliases.map(async (element) => {
          const newAlias = this.aliasFactory.create(
            element.guildId,
            element.activity
          );
          this.aliases.add(newAlias);
        })
      );
      this.logger.info(`Loaded ${this.aliases.count} aliases`);

      await Promise.all(
        guilds.map(async (element) => {
          try {
            const guild = await client.guilds.fetch(element.id);
            const newGuild = this.guildFactory.create(guild.id);
            this.guilds.add(newGuild);
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              await this.db.guild.delete({ where: { id: element.id } });
              this.logger.error(error);
            }
          }
        })
      );
      this.logger.info(`Loaded ${this.guilds.count} guilds`);

      this.mqtt.publish('dynamica/presence', client.readyAt.toISOString());

      this.logger.info('Loaded all data');
      this.logger.timeEnd('ready');
      updatePresence(client);
    } catch (error) {
      this.logger.error(error);
    }
  };
}

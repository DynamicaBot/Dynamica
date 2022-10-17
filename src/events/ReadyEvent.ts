import Aliases from '@/classes/Aliases';
import Guilds from '@/classes/Guilds';
import MQTT from '@/services/MQTT';
import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import Logger from '@/services/Logger';
import updatePresence from '@/utils/presence';
// import { updatePresence } from '@/utils';
import Event, { EventToken } from '@/classes/Event';
import { Service } from 'typedi';
import Client from '@/services/Client';

@Service({ id: EventToken, multiple: true })
export default class ReadyEvent extends Event<'ready'> {
  constructor(
    private logger: Logger,
    private mqtt: MQTT,
    private secondaries: Secondaries,
    private primaries: Primaries,
    private aliases: Aliases,
    private guilds: Guilds,
    private client: Client
  ) {
    super();
  }

  event: 'ready' = 'ready';

  once = true;

  public response: () => void | Promise<void> = async () => {
    this.logger.info(`Ready! Logged in as ${this.client.user?.tag}`);

    try {
      this.logger.time('ready');

      this.primaries.load().then(async () => {
        this.logger.info(`Loaded ${await this.primaries.count} primaries`);
      });

      this.secondaries.load().then(async () => {
        this.logger.info(`Loaded ${await this.secondaries.count} secondaries`);
      });

      this.logger.timeEnd('ready');
      this.mqtt.publish('dynamica/presence', this.client.readyAt.toISOString());
      updatePresence();
    } catch (error) {
      this.logger.error(error);
    }
  };
}

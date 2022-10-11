import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
import { Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import Secondary from './Secondary';

@Service()
export default class SecondaryFactory {
  constructor(private db: DB, private client: Client, private logger: Logger) {}

  create(channelId: string, guildId: string, primaryId: string) {
    return new Secondary(
      channelId,
      guildId,
      primaryId,
      this.db,
      this.client,
      this.logger
    );
  }
}

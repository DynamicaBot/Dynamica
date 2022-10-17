import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
import { Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import Primaries from './Primaries';
// eslint-disable-next-line import/no-cycle
import Primary from './Primary';
import Secondaries from './Secondaries';

@Service()
export default class PrimaryFactory {
  constructor(
    private db: DB,
    private client: Client,
    private secondaries: Secondaries,
    private primaries: Primaries,
    private logger: Logger
  ) {}

  create(channelId: string, guildId: string) {
    return new Primary(
      channelId,
      guildId,
      this.db,
      this.client,
      this.secondaries,
      this.logger,
      this.primaries
    );
  }
}

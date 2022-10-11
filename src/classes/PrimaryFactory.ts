import Client from '@/services/Client';
import DB from '@/services/DB';
import { Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import Primary from './Primary';

@Service()
export default class PrimaryFactory {
  constructor(private db: DB, private client: Client) {}

  create(channelId: string, guildId: string) {
    return new Primary(channelId, guildId, this.db, this.client);
  }
}

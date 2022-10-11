import Client from '@/services/Client';
import DB from '@/services/DB';
import { Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import DynamicaGuild from './Guild';

@Service()
export default class GuildFactory {
  constructor(private db: DB, private client: Client) {}

  create(id: string) {
    return new DynamicaGuild(id, this.db, this.client);
  }
}

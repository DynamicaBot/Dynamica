import DB from '@/services/DB';
import { Service } from 'typedi';
import Primary from './Primary';

@Service()
export default class PrimaryFactory {
  constructor(private db: DB) {}

  create(channelId: string, guildId: string) {
    return new Primary(channelId, guildId, this.db);
  }
}

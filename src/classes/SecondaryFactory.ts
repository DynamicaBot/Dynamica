import DB from '@/utils/db';
import { Service } from 'typedi';
import Secondary from './Secondary';

@Service()
export default class SecondaryFactory {
  constructor(private db: DB) {}

  create(channelId: string, guildId: string, primaryId: string) {
    return new Secondary(channelId, guildId, primaryId, this.db);
  }
}

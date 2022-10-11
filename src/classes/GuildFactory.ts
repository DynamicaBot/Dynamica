import DB from '@/utils/db';
import { Service } from 'typedi';
import DynamicaGuild from './Guild';

@Service()
export default class GuildFactory {
  constructor(private db: DB) {}

  create(id: string) {
    return new DynamicaGuild(id, this.db);
  }
}

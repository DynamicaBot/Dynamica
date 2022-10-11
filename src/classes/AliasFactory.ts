import DB from '@/utils/db';
import { Service } from 'typedi';
import DynamicaAlias from './Alias';

@Service()
export default class AliasFactory {
  constructor(private db: DB) {}

  create(name: string, command: string) {
    return new DynamicaAlias(name, command, this.db);
  }
}

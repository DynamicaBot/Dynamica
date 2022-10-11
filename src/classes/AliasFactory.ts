import DB from '@/services/DB';
import { Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import DynamicaAlias from './Alias';

@Service()
export default class AliasFactory {
  constructor(private db: DB) {}

  create(name: string, command: string) {
    return new DynamicaAlias(name, command, this.db);
  }
}

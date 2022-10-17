import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class AliasesHelp implements Help {
  name: string = 'aliases';

  public short = 'List all aliases for games';
}

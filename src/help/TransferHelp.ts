import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class TransferHelp implements Help {
  name = 'transfer';

  short = 'Transfer ownership to another user.';
}

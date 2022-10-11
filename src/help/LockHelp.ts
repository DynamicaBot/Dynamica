import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class LockHelp implements Help {
  name: string = 'lock';

  short = 'Use it to lock your channels away from pesky server members.';

  long = `Use it to lock your channels away from pesky server members. Locks it to the creator (initially) and permissions can be altered with /permission. 
  Channels can be reset to default with /unlock.`;
}

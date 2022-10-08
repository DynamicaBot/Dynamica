import { Help } from '@/classes/Help';

export class LockHelp extends Help {
  constructor() {
    super('lock');
  }

  short = 'Use it to lock your channels away from pesky server members.';

  long = `Use it to lock your channels away from pesky server members. Locks it to the creator (initially) and permissions can be altered with /permission. 
  Channels can be reset to default with /unlock.`;
}

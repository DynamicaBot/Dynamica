import { Help } from '@/classes/Help';

export class AllowjoinHelp extends Help {
  constructor() {
    super('allowjoin');
  }
  public short =
    'Toggles whether or not members of your sever are allowed to request to join private channels.';
}

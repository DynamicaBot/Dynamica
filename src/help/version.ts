import { Help } from '@/classes/Help';
export class VersionHelp extends Help {
  constructor() {
    super('version');
  }
  public short = 'Sends the running version of Dynamica.';
}

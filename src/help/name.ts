import { Help } from '@/classes/Help';

export class NameHelp extends Help {
  constructor() {
    super('name');
  }

  short = "Changes the name of the Secondary channel you're currently in.";
}

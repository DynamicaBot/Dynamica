import { Help } from '@/classes/Help';

export class JoinHelp extends Help {
  constructor() {
    super('join');
  }

  short =
    'If join requests are enabled then you can request to join locked secondary channels.';
}

import Help from '@/classes/Help';

export default class InfoHelp extends Help {
  constructor() {
    super('info');
  }

  short = 'Shows the info of either a user or the current server.';
}

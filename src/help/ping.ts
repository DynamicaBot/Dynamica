import Help from '@/classes/Help';

export default class PingHelp extends Help {
  constructor() {
    super('ping');
  }

  short = "Returns the Pong and the ping of the server you're currently in.";
}

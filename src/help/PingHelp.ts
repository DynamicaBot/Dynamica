import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class PingHelp implements Help {
  name: string = 'ping';

  short = "Returns the Pong and the ping of the server you're currently in.";
}

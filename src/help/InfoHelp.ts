import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class InfoHelp implements Help {
  name: string = 'info';

  short = 'Shows the info of either a user or the current server.';
}

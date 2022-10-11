import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class LimitHelp implements Help {
  name = 'limit';

  short = 'Limit the maximum number of people in the channel.';
}

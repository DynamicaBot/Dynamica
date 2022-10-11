import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class JoinHelp implements Help {
  name: string = 'join';

  short =
    'If join requests are enabled then you can request to join locked secondary channels.';
}

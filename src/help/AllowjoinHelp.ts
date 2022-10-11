import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class AllowjoinHelp implements Help {
  name = 'allowjoin';

  public short =
    'Toggles whether or not members of your sever are allowed to request to join private channels.';
}

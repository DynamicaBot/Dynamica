import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class AllyourbaseHelp implements Help {
  name: string = 'allyourbase';

  public short =
    'Transfers the ownership of the current channel to the person who ran the command. (Must be an admin)';
}

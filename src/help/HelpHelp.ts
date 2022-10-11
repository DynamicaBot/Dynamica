import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class HelpHelp implements Help {
  name: string = 'help';

  public short = 'Shows a list of commands and their asociated descriptions. ';
}

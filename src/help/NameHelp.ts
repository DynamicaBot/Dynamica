import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class NameHelp implements Help {
  name: string = 'name';

  short = "Changes the name of the Secondary channel you're currently in.";
}

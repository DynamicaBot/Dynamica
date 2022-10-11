import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class VersionHelp implements Help {
  name: string = 'version';

  public short = 'Sends the running version of Dynamica.';
}

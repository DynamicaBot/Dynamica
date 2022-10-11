import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class GeneralHelp implements Help {
  name: string = 'general';

  short =
    "Using the /general command you can set the template for the channel name of the channel you're in when nobody is playing a game.";
}

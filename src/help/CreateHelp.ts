import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class CreateHelp implements Help {
  name: string = 'bitrate';

  public short =
    'It creates a new Primary channel which your users are able to join in order to create more secondary channels.';
}

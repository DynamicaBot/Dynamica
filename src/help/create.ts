import { Help } from '@/classes/Help';

export class CreateHelp extends Help {
  constructor() {
    super('bitrate');
  }
  public short =
    'It creates a new Primary channel which your users are able to join in order to create more secondary channels.';
}

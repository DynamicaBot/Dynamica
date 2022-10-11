import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class BitrateHelp implements Help {
  name: string = 'bitrate';

  public short = 'Changes the bitrate of the current channel.';
}

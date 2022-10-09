import Help from '@/classes/Help';

export default class BitrateHelp extends Help {
  constructor() {
    super('bitrate');
  }

  public short = 'Changes the bitrate of the current channel.';
}

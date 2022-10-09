import Help from '@/classes/Help';

export default class LimitHelp extends Help {
  constructor() {
    super('limit');
  }

  short = 'Limit the maximum number of people in the channel.';
}

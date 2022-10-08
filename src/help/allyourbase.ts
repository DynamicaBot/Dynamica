import Help from '@/classes/Help';

export default class AllyourbaseHelp extends Help {
  constructor() {
    super('allyourbase');
  }

  public short =
    'Transfers the ownership of the current channel to the person who ran the command. (Must be an admin)';
}

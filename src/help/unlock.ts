import Help from '@/classes/Help';

export default class UnlockHelp extends Help {
  constructor() {
    super('unlock');
  }

  short =
    'This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission.';
}

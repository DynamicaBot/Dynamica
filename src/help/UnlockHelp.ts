import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class UnlockHelp implements Help {
  name = 'unlock';

  short =
    'This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission.';
}

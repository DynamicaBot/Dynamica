import Help, { HelpToken } from '@/classes/Help';
import { Service } from 'typedi';

@Service({ id: HelpToken, multiple: true })
export default class PermissionHelp implements Help {
  name = 'permission';

  public short =
    'Edits the permissions for secondary channels. (Works in conjuction with /lock and /unlock.';
}

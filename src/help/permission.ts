import Help from '@/classes/Help';

export default class PermissionHelp extends Help {
  constructor() {
    super('permission');
  }

  public short =
    'Edits the permissions for secondary channels. (Works in conjuction with /lock and /unlock.';
}

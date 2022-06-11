import Help from '@/classes/help';
import alias from './alias';
import allowjoin from './allowjoin';
import allyourbase from './allyourbase';
import bitrate from './bitrate';
import create from './create';
import general from './general';
import help from './help';
import info from './info';
import join from './join';
import limit from './limit';
import lock from './lock';
import name from './name';
import permission from './permission';
import ping from './ping';
import template from './template';
import transfer from './transfer';
import unlock from './unlock';
import version from './version';

interface HelpInterface {
  [key: string]: Help;
}

const exports: HelpInterface = {
  alias,
  allowjoin,
  allyourbase,
  info,
  join,
  limit,
  create,
  bitrate,
  general,
  help,
  lock,
  name,
  permission,
  ping,
  template,
  transfer,
  unlock,
  version,
};

export default exports;

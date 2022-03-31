import Command from '@/classes/command';
import alias from './alias';
import allowjoin from './allowjoin';
import allyourbase from './allyourbase';
import bitrate from './bitrate';
import create from './create';
import general from './general';
// eslint-disable-next-line import/no-cycle
import help from './help';
import info from './info';
import join from './join';
import limit from './limit';
import lock from './lock';
import name from './name';
import permission from './permission';
import ping from './ping';
import template from './template';
import text from './text';
import transfer from './transfer';
import unlock from './unlock';
import version from './version';

interface CommandsInterface {
  [key: string]: Command;
}

const exports: CommandsInterface = {
  alias,
  allowjoin,
  allyourbase,
  bitrate,
  create,
  general,
  help,
  info,
  join,
  limit,
  lock,
  name,
  permission,
  ping,
  template,
  text,
  transfer,
  unlock,
  version,
};

export default exports;

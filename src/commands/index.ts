import Command from '@/classes/command';
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
  transfer,
  unlock,
  version,
};

const commandList = Object.values(exports);
export const commandData = commandList.map((command) =>
  command.commandData.toJSON()
);

export default exports;

import { Container } from 'typedi';
import { CommandToken } from './classes/Command';
import Commands from './classes/Commands';
import AliasCommand from './commands/AliasCommand';
import AliasesCommand from './commands/AliasesCommand';
import AllowjoinCommand from './commands/AllowjoinCommand';
import AllyourbaseCommand from './commands/AllyourbaseCommand';
import BitrateCommand from './commands/BitrateCommand';
import CreateCommand from './commands/CreateCommand';
import GeneralCommand from './commands/GeneralCommand';
import HelpCommand from './commands/HelpCommand';
import InfoCommand from './commands/InfoCommand';
import JoinCommand from './commands/JoinCommand';
import LimitCommand from './commands/LimitCommand';
import LockCommand from './commands/LockCommand';
import NameCommand from './commands/NameCommand';
import PermissionCommand from './commands/PermissionCommand';
import PingCommand from './commands/PingCommand';
import TemplateCommand from './commands/TemplateCommand';
import TransferCommand from './commands/TransferCommand';
import UnlockCommand from './commands/UnlockCommand';
import VersionCommand from './commands/VersionCommand';

const registerCommands = () => {
  Container.import([
    AliasCommand,
    AliasesCommand,
    AllowjoinCommand,
    AllyourbaseCommand,
    BitrateCommand,
    CreateCommand,
    GeneralCommand,
    HelpCommand,
    InfoCommand,
    JoinCommand,
    LimitCommand,
    LockCommand,
    NameCommand,
    PermissionCommand,
    PingCommand,
    TemplateCommand,
    TransferCommand,
    UnlockCommand,
    VersionCommand,
  ]);
  Container.getMany(CommandToken).forEach((command) => {
    Container.get(Commands).register(command);
  });
};

export default registerCommands;

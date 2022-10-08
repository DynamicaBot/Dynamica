import { Commands } from './classes/Command';
import {
  AliasCommand,
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
} from './commands';

export class RegisterCommands {
  constructor() {
    Commands.register(new AliasCommand());
    Commands.register(new AllowjoinCommand());
    Commands.register(new AllyourbaseCommand());
    Commands.register(new BitrateCommand());
    Commands.register(new CreateCommand());
    Commands.register(new GeneralCommand());
    Commands.register(new HelpCommand());
    Commands.register(new InfoCommand());
    Commands.register(new JoinCommand());
    Commands.register(new LimitCommand());
    Commands.register(new LockCommand());
    Commands.register(new NameCommand());
    Commands.register(new PermissionCommand());
    Commands.register(new PingCommand());
    Commands.register(new TemplateCommand());
    Commands.register(new TransferCommand());
    Commands.register(new UnlockCommand());
    Commands.register(new VersionCommand());
  }
}

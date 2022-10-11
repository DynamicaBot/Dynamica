import { Container } from 'typedi';
import { HelpToken } from './classes/Help';
import Helps from './classes/Helps';
import AliasesHelp from './help/AliasesHelp';
import AliasHelp from './help/AliasHelp';
import AllowjoinHelp from './help/AllowjoinHelp';
import AllyourbaseHelp from './help/AllyourbaseHelp';
import BitrateHelp from './help/BitrateHelp';
import CreateHelp from './help/CreateHelp';
import GeneralHelp from './help/GeneralHelp';
import HelpHelp from './help/HelpHelp';
import InfoHelp from './help/InfoHelp';
import JoinHelp from './help/JoinHelp';
import LimitHelp from './help/LimitHelp';
import LockHelp from './help/LockHelp';
import NameHelp from './help/NameHelp';
import PermissionHelp from './help/PermissionHelp';
import PingHelp from './help/PingHelp';
import TemplateHelp from './help/TemplateHelp';
import TransferHelp from './help/TransferHelp';
import UnlockHelp from './help/UnlockHelp';
import VersionHelp from './help/VersionHelp';

const registerHelp = () => {
  Container.import([
    AliasesHelp,
    AliasHelp,
    AllowjoinHelp,
    AllyourbaseHelp,
    BitrateHelp,
    CreateHelp,
    GeneralHelp,
    HelpHelp,
    InfoHelp,
    JoinHelp,
    LimitHelp,
    LockHelp,
    NameHelp,
    PermissionHelp,
    PingHelp,
    TemplateHelp,
    TransferHelp,
    UnlockHelp,
    VersionHelp,
  ]);
  Container.getMany(HelpToken).forEach((help) => {
    Container.get(Helps).register(help);
  });
};

export default registerHelp;

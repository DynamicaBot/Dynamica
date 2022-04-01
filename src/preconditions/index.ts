import Condition from '@/classes/condition';
import checkAdmin from './admin';
import checkCreator from './creator';
import checkGuild from './guild';
import checkManager from './manager';
import checkSecondary from './secondary';

interface ExportTypes {
  [key: string]: Condition;
}

const exports: ExportTypes = {
  checkAdmin,
  checkCreator,
  checkManager,
  checkSecondary,
  checkGuild,
};

export default exports;

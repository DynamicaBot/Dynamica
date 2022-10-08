import { config } from 'dotenv';
import deploy from './scripts/deploy';

config();

(async () => {
  await deploy();
})();

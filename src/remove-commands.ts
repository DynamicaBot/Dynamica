import { config } from 'dotenv';
import remove from './scripts/remove';

config();

(async () => {
  await remove();
})();

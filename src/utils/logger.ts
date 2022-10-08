import { config } from 'dotenv';
import signale from 'signale';

config();

/** Signale Logger instance */
const logger = new signale.Signale({
  disabled: false,
  interactive: false,
});

export default logger;

import { config } from 'dotenv';
import signale from 'signale';

config();

/** Signale Logger instance */
const logger = new signale.Signale({
  disabled: false,
  interactive: false,
  // logLevel: process.env.LOG_LEVEL || 'info',
  // config: {
  //   displayDate: false,
  //   displayTimestamp: false,
  // },
});

export default logger;

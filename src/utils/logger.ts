import { config } from 'dotenv';
import signale from 'signale';
import { Service } from 'typedi';

config();

/** Signale Logger instance */
@Service()
export default class Logger extends signale.Signale {
  constructor() {
    super({ disabled: false, interactive: false });
  }
}
// const logger = new signale.Signale({
//   disabled: false,
//   interactive: false,
// });

// export default logger;

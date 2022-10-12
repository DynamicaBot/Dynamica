import signale from 'signale';
import { Service, Token } from 'typedi';

export const LoggerToken = new Token<Logger>('Logger');

/** Signale Logger instance */
@Service({ id: Logger })
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

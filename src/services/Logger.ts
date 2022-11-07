import { Signales } from '@dynamicabot/signales';
import { Service, Token } from 'typedi';
import fs from 'node:fs';
import fsP from 'node:fs/promises';

export const LoggerToken = new Token<Logger>('Logger');

// generate file name depending on the date (e.g. 2021-09-01-1.log, 2021-09-01-2.log, etc.) with a suffix parameter
const createLogfileWriter = async (suffix: string = 'log') => {
  await fsP.mkdir('logs', { recursive: true });
  const date = new Date();
  const filename = `logs/${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}-${suffix}.log`;
  const writer = fs.createWriteStream(filename);

  return writer;
};

const logFile = await createLogfileWriter();

const errorFile = await createLogfileWriter('error');

/** Signale Logger instance */
@Service({ id: Logger })
export default class Logger extends Signales {
  constructor() {
    super({
      // scopeFormatter: (scope) => `[${scope.join('::')}]`,
      disabled: false,
      interactive: false,
      stream: [logFile, process.stdout],
      config: {
        displayScope: true,
        displayBadge: true,
        displayDate: true,
        displayTimestamp: true,
        displayLabel: true,
        displayFilename: true,
      },
      types: {
        error: {
          stream: [errorFile, process.stderr, process.stdout],
        },
      },
    });
  }
}
// export default logger;

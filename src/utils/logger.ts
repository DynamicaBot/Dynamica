import { config } from "dotenv";
import signale from "signale";
config();

/** Signale Logger instance */
const logger = new signale.Signale({
  disabled: false,
  interactive: false,
  stream: [process.stdout],
  logLevel: process.env.LOG_LEVEL || "info",
  config: {
    displayDate: false,
    displayTimestamp: true,
  },
});

export default logger;

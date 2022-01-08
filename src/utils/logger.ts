import { config } from "dotenv";
import { Signale } from "signale";
config();
/** Signale Logger instance */
export const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
});

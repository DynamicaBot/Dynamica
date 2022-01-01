import signaleLogger from "signale";

const { Signale } = signaleLogger;

export const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
});

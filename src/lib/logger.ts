import signaleLogger from "signale";

const { Signale } = signaleLogger;

export const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
  secrets: [
    process.env.TOKEN,
    process.env.CLIENT_ID,
    process.env.GUILD_ID,
    process.env.DATABASE_URL,
  ],
});

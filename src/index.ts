import Bree from "bree";
import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import signale from "signale";
import * as events from "./events/index";
import { db } from "./lib/prisma";
dotenv.config();

const { Signale } = signale;

/**
 * Signale Logger instance
 */
export const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
  secrets: [process.env.TOKEN, process.env.CLIENT_ID],
});

/**
 * DiscordJS Client instance
 */
export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

/**
 * Bree instance
 */
export const bree = new Bree({
  root: false,
  logger: false,
  errorHandler: (error, workerMetadata) => {
    if (workerMetadata.threadId) {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    logger.error(error);
  },
});

const eventList = Object.values(events);
try {
  // Register event handlers
  for (const event of eventList) {
    if (event.once) {
      client.once(event.event, (...args) => event.execute(...args));
    } else {
      client.on(event.event, (...args) => event.execute(...args));
    }
  }

  client.login(process.env.TOKEN);
} catch (error) {
  logger.error(error);
}

// Handle stop signal
process.on("SIGINT", () => {
  client.destroy();
  bree.stop();
  db.$disconnect();
  logger.info("Bot Stopped");
});

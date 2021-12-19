import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import * as events from "./events";
import { logger } from "./lib/logger";
import { db } from "./lib/prisma";
import { scheduler } from "./lib/scheduler";
dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

const eventList = Object.values(events);

// Register event handlers
for (const event of eventList) {
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

// Login to Discord with your client's token
client.login(process.env.TOKEN);

// Handle stop signal
process.on("SIGINT", () => {
  client.destroy();
  scheduler.stop();
  db.$disconnect();
  logger.info("Bot Stopped");
});

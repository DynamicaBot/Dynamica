import { Client } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import { getChannel } from "../lib/getCached.js";
import { logger } from "../lib/logger.js";
import { updateActivityCount } from "../lib/operations/general.js";
import { db } from "../lib/prisma.js";
import { bree } from "../lib/scheduler.js";
import { event } from "./event.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ready: event = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    console.log(client.channels);
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    const secondaries = await db.secondary.findMany();
    const workers = await Promise.all(
      secondaries.map(async (secondary) => {
        const channel = await getChannel(client.channels, secondary.id);
        return {
          name: secondary.id,
          worker: {
            workerData: {
              channel,
              channelManager: client.channels,
            },
          },
          path: path.join(__dirname, "../jobs", "refreshSecondary.js"),
        };
      })
    );
    bree.add(workers);
    updateActivityCount(client);
  },
};

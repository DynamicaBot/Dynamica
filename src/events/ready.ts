import { Client } from "discord.js";
import path from "path";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { fileURLToPath } from "url";
import { updateActivityCount } from "../lib/operations/general.js";
import { registerJobs, startJobs } from "../lib/scheduler.js";
import { kLogger } from "../tokens.js";
import { event } from "./event.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ready: event = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const logger = container.resolve<Signale>(kLogger);
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    registerJobs().then(() => {
      startJobs();
    });
    updateActivityCount(client);
  },
};

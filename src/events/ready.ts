import { Client } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { updateActivityCount } from "../lib/operations/general";
import { registerJobs, startJobs } from "../lib/scheduler";
import { kLogger } from "../tokens";
import type { Event } from "./";

export const ready: Event = {
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

import { Client } from "discord.js";
import { Event } from "../Event";
import { registerJobs, startJobs } from "../jobs";
import { logger } from "../utils/logger";
import { updateActivityCount } from "../utils/operations/general";

export const ready: Event = {
  once: true,
  event: "ready",
  async execute(client: Client<true>) {
    logger.success(`Ready! Logged in as ${client.user?.tag}`);
    registerJobs().then(() => {
      startJobs();
    });
    updateActivityCount(client);
  },
};

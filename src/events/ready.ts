import { Client } from "discord.js";
import { logger } from "..";
import { Event } from "../Event";
import { registerJobs, startJobs } from "../jobs";
import { updateActivityCount } from "../utils/operations/general";

export const ready: Event = {
  once: true,
  event: "ready",
  async execute(client: Client<true>) {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    registerJobs().then(() => {
      startJobs();
    });
    updateActivityCount(client);
  },
};

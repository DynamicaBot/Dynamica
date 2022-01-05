import { Client } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { EventBuilder } from "../lib/builders";
import { updateActivityCount } from "../lib/operations/general";
import { registerJobs, startJobs } from "../lib/scheduler";
import { kLogger } from "../tokens";

export const ready = new EventBuilder()
  .setName("ready")
  .setOnce(true)
  .setResponse(async (client: Client) => {
    const logger = container.resolve<Signale>(kLogger);
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    registerJobs().then(() => {
      startJobs();
    });
    updateActivityCount(client);
  });

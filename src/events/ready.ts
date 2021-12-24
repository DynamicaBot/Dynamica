import { Client } from "discord.js";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { getChannel } from "../lib/getCached";
import { logger } from "../lib/logger";
import { updateActivityCount } from "../lib/operations/general";
import { refreshSecondary } from "../lib/operations/secondary";
import { db } from "../lib/prisma";
import { scheduler } from "../lib/scheduler";
import { event } from "./event";

export const ready: event = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    const secondaries = await db.secondary.findMany();
    logger.time("refreshchannels");
    Promise.all(
      secondaries.map(async (secondary) => {
        // const cachedChannel = client.channels.cache.get(secondary.id);
        const channel = await getChannel(client.channels, secondary.id);

        channel?.isVoice()
          ? scheduler.addSimpleIntervalJob(
              new SimpleIntervalJob(
                { minutes: 5 },
                new Task(secondary.id, () => refreshSecondary(channel))
              )
            )
          : Promise.resolve();

        return channel?.isVoice()
          ? refreshSecondary(channel)
          : Promise.reject("Failed to refresh channels.");
      })
    )
      .catch((error) => logger.error(error))
      .then(() => logger.timeEnd("refreshchannels"));
    updateActivityCount(client);
  },
};

import { prisma } from "../lib/prisma";
import { Client } from "discord.js";
import { debug, info, log, error } from "../lib/colourfulLogger";
import { scheduler } from "../lib/scheduler";
import { AsyncTask, SimpleIntervalJob, Task } from "toad-scheduler";
import { refreshSecondary, updateActivityCount } from "../lib/operations";

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    info(`Ready! Logged in as ${client.user?.tag}`);
    const secondaries = await prisma.secondary.findMany();
    Promise.all(
      secondaries.map(async (secondary) => {
        const channel = client.channels.cache.get(secondary.id)
          ? client.channels.cache.get(secondary.id)
          : await client.channels.fetch(secondary.id);

        return channel?.isVoice()
          ? refreshSecondary(channel)
          : Promise.reject("Failed to refresh channels.");
      })
    )
      .catch((error) => error(error))
      .then(() => debug("Channels Restored"));
    updateActivityCount(client);
  },
};

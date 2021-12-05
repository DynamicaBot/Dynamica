import { prisma } from "../lib/prisma";
import { Client } from "discord.js";
import { debug, info } from "../lib/colourfulLogger";
import { scheduler } from "../lib/scheduler";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { updateActivityCount } from "../lib/operations/general";
import { refreshSecondary } from "../lib/operations/secondary";

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
      .catch((error) => error(error))
      .then(() => debug("Channels Restored"));
    updateActivityCount(client);
  },
};

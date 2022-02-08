import { Client } from "discord.js";
import { Event } from "../Event";
import { db } from "../utils/db";
import { logger } from "../utils/logger";
import { updateActivityCount } from "../utils/operations/general";
import { editChannel } from "../utils/operations/secondary";

export const ready: Event = {
  once: true,
  event: "ready",
  async execute(client: Client<true>) {
    const activeSecondaries = await db.secondary.findMany();
    for (let index = 0; index < activeSecondaries.length; index++) {
      const element = activeSecondaries[index];
      const channel = await client.channels.fetch(element.id);
      if (!channel.isVoice()) return;
      editChannel({ channel });
    }
    logger.info(`Ready! Logged in as ${client.user?.tag}`);
    updateActivityCount(client);
  },
};

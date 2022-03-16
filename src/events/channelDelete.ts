import { Channel, DMChannel } from "discord.js";
import { Event } from ".";
import { db } from "../utils/db";

export const channelDelete = new Event()
  .setOnce(false)
  .setEvent("channelDelete")
  .setResponse(async ({ id }: Channel | DMChannel) => {
    const primary = await db.primary.findUnique({ where: { id } });
    const secondary = await db.secondary.findUnique({ where: { id } });

    if (primary) {
      await db.primary.delete({
        where: { id },
        include: { secondaries: true },
      });
    } else if (secondary) {
      await db.secondary.delete({ where: { id } });
    }
  });

import { Channel, DMChannel } from "discord.js";
import { Event } from "../Event";
import { db } from "../lib/prisma";

export const channelDelete: Event = {
  event: "channelDelete",
  once: false,
  async execute({ id }: Channel | DMChannel) {
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
  },
};

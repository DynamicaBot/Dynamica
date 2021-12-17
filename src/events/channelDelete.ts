import { GuildChannel } from "discord.js";
import { db } from "../lib/prisma";
import { event } from "./event";

export const channelDelete: event = {
  name: "channelDelete",
  once: false,
  async execute({ id }: GuildChannel) {
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

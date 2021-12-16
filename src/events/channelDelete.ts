import { db } from "@db";
import { error } from "@lib/colourfulLogger";
import { GuildChannel } from "discord.js";
import { event } from "./event";

export const channelDelete: event = {
  name: "channelDelete",
  once: false,
  async execute({ id }: GuildChannel) {
    try {
      const primary = await db.primary.findUnique({
        where: { id },
      });
      const secondary = await db.secondary.findUnique({
        where: { id },
      });

      if (primary) {
        return db.primary.delete({
          where: { id },
          include: { secondaries: true },
        });
      } else if (secondary) {
        return db.secondary.delete({ where: { id } });
      }
    } catch (e) {
      error(e);
    }
  },
};

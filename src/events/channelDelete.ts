import { GuildChannel } from "discord.js";
import { EventBuilder } from "../lib/builders";
import { db } from "../lib/prisma";

export const channelDelete = new EventBuilder()
  .setName("channelDelete")
  .setOnce(false)
  .setResponse(async ({ id }: GuildChannel) => {
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

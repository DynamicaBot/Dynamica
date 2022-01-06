import type Bree from "bree";
import { Presence } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { EventBuilder } from "../lib/builders";
import { db } from "../lib/prisma";
import { kBree, kLogger } from "../tokens";

export const presenceUpdate = new EventBuilder()
  .setName("presenceUpdate")
  .setOnce(false)
  .setResponse(async (oldPresence: Presence, newPresence: Presence) => {
    if (
      oldPresence?.activities?.at(0)?.name ===
      newPresence?.activities?.at(0)?.name
    )
      return;
    const logger = container.resolve<Signale>(kLogger);
    const bree = container.resolve<Bree>(kBree);
    const voiceChannel = newPresence.member.voice.channel;
    if (!voiceChannel) return;
    const secondaryConfig = await db.secondary.findUnique({
      where: { id: voiceChannel.id },
    });
    if (!secondaryConfig) return;

    try {
      bree.run(voiceChannel.id);
    } catch (error) {
      logger.error("failed channel name refresh (run) ", error);
    }
  });

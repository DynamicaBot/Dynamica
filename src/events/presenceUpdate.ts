import type Bree from "bree";
import { Presence } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { db } from "../lib/prisma.js";
import { kBree, kLogger } from "../tokens.js";
import { event } from "./event.js";

export const presenceUpdate: event = {
  once: false,
  name: "presenceUpdate",
  async execute(oldPresence: Presence, newPresence: Presence) {
    if (oldPresence?.activities[0]?.name === newPresence?.activities[0]?.name)
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
  },
};

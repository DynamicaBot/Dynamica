import { Presence } from "discord.js";
import { Event } from "../Event";
import { bree } from "../utils/bree";
import { db } from "../utils/db";
import { logger } from "../utils/logger";

export const presenceUpdate: Event = {
  event: "presenceUpdate",
  once: false,
  async execute(oldPresence: Presence, newPresence: Presence) {
    if (
      oldPresence?.activities?.at(0)?.name ===
      newPresence?.activities?.at(0)?.name
    )
      return;
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

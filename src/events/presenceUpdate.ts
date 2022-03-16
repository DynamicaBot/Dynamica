import { Presence } from "discord.js";
import { Event } from ".";
import { db } from "../utils/db";
import { logger } from "../utils/logger";
import { editChannel } from "../utils/operations/secondary";

export const presenceUpdate = new Event()
  .setOnce(false)
  .setEvent("presenceUpdate")
  .setResponse(async (oldPresence: Presence, newPresence: Presence) => {
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
      editChannel({ channel: voiceChannel });
    } catch (error) {
      logger.error("failed channel name refresh (run) ", error);
    }
  });

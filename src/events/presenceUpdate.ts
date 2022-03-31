import Event from "@classes/event";
import DynamicaSecondary from "@classes/secondary";
import { Presence } from "discord.js";

export const presenceUpdate = new Event()
  .setOnce(false)
  .setEvent("presenceUpdate")
  .setResponse(async (oldPresence: Presence, newPresence: Presence) => {
    if (
      oldPresence?.activities?.at(0)?.name ===
      newPresence?.activities?.at(0)?.name
    )
      return;
    const { channelId } = newPresence.member.voice;
    if (!channelId) {
      return;
    }
    const dynamicaSecondary = await new DynamicaSecondary(
      newPresence.client,
      channelId
    ).fetch();

    if (dynamicaSecondary) {
      dynamicaSecondary.update();
    }
  });

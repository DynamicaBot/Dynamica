import { Presence } from "discord.js";
import Event from "../classes/event.js";
import DynamicaSecondary from "../classes/secondary.js";

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
    const dynamicaSecondary = await new DynamicaSecondary(
      newPresence.client
    ).fetch(channelId);

    if (dynamicaSecondary) {
      dynamicaSecondary.update();
    }
  });

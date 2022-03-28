import { Channel, DMChannel } from "discord.js";
import Event from "../classes/event.js";
import DynamicaPrimary from "../classes/primary.js";
import DynamicaSecondary from "../classes/secondary.js";

export const channelDelete = new Event()
  .setOnce(false)
  .setEvent("channelDelete")
  .setResponse(async (channel: Channel | DMChannel) => {
    // logger.debug(channel);
    const primary = await new DynamicaPrimary(channel.client).fetch(channel.id);
    const secondary = await new DynamicaSecondary(channel.client).fetch(
      channel.id
    );

    if (primary) {
      primary.delete();
    } else if (secondary) {
      secondary.delete();
    }
  });

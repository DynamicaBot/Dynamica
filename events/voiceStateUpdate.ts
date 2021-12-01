import { VoiceState } from "discord.js";
import { prisma } from "../lib/prisma";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    // If the channel doesn't change then just ignore it.
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      /**
       * Check Database for primary channel
       * @param channelId Discord Channel Id
       */
      const matchingrimaryChannel = async (channelId: string | null) =>
        channelId
          ? await prisma.primaryChannel.findUnique({
              where: {
                channelId,
              },
            })
          : undefined;

      /**
       * Check Database for subchannel
       * @param channelId Discord Channel Id
       */
      const matchingSubchannel = async (channelId: string | null) =>
        channelId
          ? await prisma.subchannel.findUnique({
              where: {
                channelId,
              },
            })
          : undefined;

      // User leaves primary
      if (await matchingrimaryChannel(oldVoiceState.channelId)) {
        // Event will be ignored most of the time as user should be automagically moved.
        console.log("user left primary");
      }

      // User joins primary
      if (await matchingrimaryChannel(newVoiceState.channelId)) {
        // Trigger move event and create new subchannel.
        console.log("user joined primary");
      }

      // User leaves subchannel
      if (await matchingSubchannel(oldVoiceState.channelId)) {
        // Check if subchannel is empty and if so then remove.
        console.log("user left subchannel");
      }
    }
  },
};

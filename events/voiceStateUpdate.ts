import { VoiceState } from "discord.js";
import { prisma } from "..";
import { channels } from "../lib/keyv";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      // Channel Change
      const matchingOldChannel = oldVoiceState.channelId
        ? prisma.primaryChannel.findUnique({
            where: {
              channelId: oldVoiceState.channelId,
            },
          })
        : undefined;
      const matchingNewChannel = newVoiceState.channelId
        ? prisma.primaryChannel.findUnique({
            where: {
              channelId: newVoiceState.channelId,
            },
          })
        : undefined;

      // if (oldVoiceState.channelId && )
      if (!newVoiceState.channelId && matchingOldChannel) {
        console.log("Leave event");
      }

      if (matchingNewChannel) {
        console.log("new channel from any channel");
      }
    }
  },
};

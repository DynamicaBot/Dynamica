import { VoiceState } from "discord.js";
import { createSecondary, deleteSecondary } from "../lib/operations";
import { prisma } from "../lib/prisma";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    // If the channel doesn't change then just ignore it.
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      // User joins primary
      if (newVoiceState.channelId && newVoiceState.member) {
        await createSecondary(
          newVoiceState.guild.channels,
          newVoiceState.channelId,
          newVoiceState.member
        );
      }

      // User leaves subchannel
      if (oldVoiceState.channelId) {
        await deleteSecondary(
          oldVoiceState.guild.channels,
          oldVoiceState.channelId
        );
      }
    }
  },
};

import { VoiceState } from "discord.js";
import {
  createSecondary,
  deleteSecondary,
  refreshSecondary,
} from "../lib/operations";
import { prisma } from "../lib/prisma";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    // If the channel doesn't change then just ignore it.
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      // User joins channel
      if (newVoiceState.channelId && newVoiceState.member) {
        await createSecondary(
          newVoiceState.guild.channels,
          newVoiceState.channelId,
          newVoiceState.member
        );
        // await refreshSecondary(
        //   newVoiceState.channelId,
        //   newVoiceState.guild.channels
        // );
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

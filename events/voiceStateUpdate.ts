import { VoiceState } from "discord.js";
import { createSecondary, deleteSecondary } from "../lib/operations";

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
      if (oldVoiceState.channel) {
        await deleteSecondary(oldVoiceState.channel);
      }
    }
  },
};

import { VoiceState } from "discord.js";
import { createSecondary, deleteSecondary } from "@/lib/operations/secondary";

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
      }

      // User leaves subchannel
      if (oldVoiceState.channel) {
        await deleteSecondary(oldVoiceState.channel);
      }
    }
  },
};

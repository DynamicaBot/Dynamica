import Event from '@classes/Event';
import DynamicaPrimary from '@classes/Primary';
import DynamicaSecondary from '@classes/Secondary';
import { VoiceState } from 'discord.js';

export default new Event<'voiceStateUpdate'>()
  .setOnce(false)
  .setEvent('voiceStateUpdate')
  .setResponse(async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.

    // User joins channel
    if (newVoiceState.channel && newVoiceState.member) {
      /** Look for an existing secondary channel */

      /** Look for an existing primary channel */
      const existingPrimary = DynamicaPrimary.get(newVoiceState?.channelId);
      const existingSecondary = DynamicaSecondary.get(newVoiceState?.channelId);

      console.log({ existingPrimary, existingSecondary });
      // Create a new secondary if one doesn't already exist and the user has joined a primary channel
      if (existingPrimary) {
        const newSecondary = DynamicaSecondary.initalise(
          newVoiceState.client,
          existingPrimary,
          newVoiceState.guild,
          newVoiceState.member
        );
        // await newSecondary.create(
        //   primary,
        //   newVoiceState.guild,
        //   newVoiceState.member
        // );
      } else if (existingSecondary) {
        // If a secondary exists then attempt to update the name;
        if (newVoiceState.channel.members.size !== 1) {
          await existingSecondary.update(newVoiceState.client);
        }
      }
    }

    // User leaves channel
    if (oldVoiceState.channel && oldVoiceState.member) {
      const existingSecondary = DynamicaSecondary.get(oldVoiceState.channel.id);

      if (existingSecondary) {
        if (oldVoiceState.channel.members.size !== 0) {
          existingSecondary.update(oldVoiceState.client);
        } else {
          existingSecondary.delete(oldVoiceState.client);
        }
      }
    }
  });

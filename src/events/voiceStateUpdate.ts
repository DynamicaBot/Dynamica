import Event from '@classes/event';
import DynamicaPrimary from '@classes/primary';
import DynamicaSecondary from '@classes/secondary';
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
      const existingSecondary = await new DynamicaSecondary(
        newVoiceState.client,
        newVoiceState.channel.id
      ).fetch();

      /** Look for an existing primary channel */
      const primary = await new DynamicaPrimary(
        newVoiceState.client,
        newVoiceState.channel.id
      ).fetch();

      // Create a new secondary if one doesn't already exist and the user has joined a primary channel
      if (primary) {
        const newSecondary = new DynamicaSecondary(newVoiceState.client);
        await newSecondary.create(
          primary,
          newVoiceState.guild,
          newVoiceState.member
        );
      } else if (existingSecondary) {
        // If a secondary exists then attempt to update the name;
        if (newVoiceState.channel.members.size !== 1) {
          await existingSecondary.update();
        }
      }
    }

    // User leaves channel
    if (oldVoiceState.channel && oldVoiceState.member) {
      const secondary = await new DynamicaSecondary(
        oldVoiceState.client,
        oldVoiceState.channel.id
      ).fetch();

      if (secondary) {
        if (oldVoiceState.channel.members.size !== 0) {
          secondary.update();
        } else {
          secondary.delete();
        }
      }
    }
  });

import { updatePresence } from '@/utils';
import { Event } from '@classes/Event';
import DynamicaPrimary from '@classes/Primary';
import DynamicaSecondary from '@classes/Secondary';
import { VoiceState } from 'discord.js';

export class VoiceStateUpdateEvent extends Event<'voiceStateUpdate'> {
  constructor() {
    super('voiceStateUpdate');
  }

  public response: (
    oldVoiceState: VoiceState,
    newVoiceState: VoiceState
  ) => void | Promise<void> = async (
    oldVoiceState: VoiceState,
    newVoiceState: VoiceState
  ) => {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.

    const oldChannelPrimary = DynamicaPrimary.get(oldVoiceState?.channelId);
    const oldChannelSecondary = DynamicaSecondary.get(oldVoiceState.channelId);

    const newChannelPrimary = DynamicaPrimary.get(newVoiceState.channelId);
    const newChannelSecondary = DynamicaSecondary.get(newVoiceState.channelId);

    if (oldChannelSecondary) {
      const oldSecondaryDiscord = await oldChannelSecondary.discord(
        oldVoiceState.client
      );
      if (oldSecondaryDiscord.members.size === 0) {
        await oldChannelSecondary.delete(oldVoiceState.client);
      } else {
        await oldChannelSecondary.update(oldVoiceState.client);
      }
    }

    if (newChannelPrimary) {
      await DynamicaSecondary.initalise(
        newChannelPrimary,
        newVoiceState.member
      );
      updatePresence(newVoiceState.client);
    }

    if (newChannelSecondary) {
      await newChannelSecondary.update(newVoiceState.client);
    }
  };
}

import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import updatePresence from '@/utils/presence';
import Event from '@classes/Event';
import DynamicaSecondary from '@classes/Secondary';
import { VoiceState } from 'discord.js';

export default class VoiceStateUpdateEvent extends Event<'voiceStateUpdate'> {
  constructor() {
    super('voiceStateUpdate');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    oldVoiceState: VoiceState,
    newVoiceState: VoiceState
  ) => void | Promise<void> = async (
    oldVoiceState: VoiceState,
    newVoiceState: VoiceState
  ) => {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.
    const oldChannelSecondary = Secondaries.get(oldVoiceState.channelId);

    const newChannelPrimary = Primaries.get(newVoiceState.channelId);
    const newChannelSecondary = Secondaries.get(newVoiceState.channelId);

    if (oldChannelSecondary) {
      await oldChannelSecondary.update(oldVoiceState.client);
    }

    if (newChannelPrimary) {
      await DynamicaSecondary.initalise(
        newVoiceState.channel,
        newVoiceState.member
      );
      updatePresence(newVoiceState.client);
    }

    if (newChannelSecondary) {
      await newChannelSecondary.update(newVoiceState.client);
    }
  };
}

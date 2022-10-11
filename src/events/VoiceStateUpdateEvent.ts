import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import updatePresence from '@/utils/presence';
import Event, { EventToken } from '@classes/Event';
import DynamicaSecondary from '@classes/Secondary';
import { VoiceState } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class VoiceStateUpdateEvent
  implements Event<'voiceStateUpdate'>
{
  constructor(private secondaries: Secondaries, private primaries: Primaries) {}

  event: 'voiceStateUpdate' = 'voiceStateUpdate';

  once: boolean = false;

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
    const oldChannelSecondary = this.secondaries.get(oldVoiceState.channelId);

    const newChannelPrimary = this.primaries.get(newVoiceState.channelId);
    const newChannelSecondary = this.secondaries.get(newVoiceState.channelId);

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

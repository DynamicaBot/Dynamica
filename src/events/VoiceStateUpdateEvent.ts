import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import updatePresence from '@/utils/presence';
import Event, { EventToken } from '@/classes/Event';
import { DiscordAPIError, VoiceState } from 'discord.js';
import { Service } from 'typedi';
import Logger from '@/services/Logger';

@Service({ id: EventToken, multiple: true })
export default class VoiceStateUpdateEvent extends Event<'voiceStateUpdate'> {
  constructor(
    private secondaries: Secondaries,
    private primaries: Primaries,
    private logger: Logger
  ) {
    super();
  }

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
    const oldChannelSecondary = await this.secondaries.get(
      oldVoiceState.channelId
    );

    const newChannelPrimary = await this.primaries.get(newVoiceState.channelId);
    const newChannelSecondary = await this.secondaries.get(
      newVoiceState.channelId
    );

    if (oldChannelSecondary) {
      try {
        await oldChannelSecondary.update();
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          if (error.code === 50001) {
            await oldChannelSecondary.delete();
          } else if (error.code === 10003) {
            await oldChannelSecondary.delete(false, true);
          } else {
            this.logger.error(error);
          }
        } else {
          this.logger.error(error);
        }
      }
    }

    if (newChannelPrimary) {
      await this.secondaries.initalise(
        newVoiceState.channel,
        newVoiceState.member
      );
      updatePresence();
    }

    if (newChannelSecondary) {
      await newChannelSecondary.update();
    }
  };
}

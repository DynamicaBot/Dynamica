import Event from '@/classes/Event';
import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import { DMChannel, NonThreadGuildBasedChannel } from 'discord.js';

export default class ChannelDeleteEvent extends Event<'channelDelete'> {
  constructor() {
    super('channelDelete');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    channel: DMChannel | NonThreadGuildBasedChannel
  ) => void | Promise<void> = async (channel) => {
    if (channel.isDMBased()) return;
    if (channel.isThread()) return;

    const primary = Primaries.get(channel.id);
    const secondary = Secondaries.get(channel.id);

    if (primary) {
      try {
        await primary.delete(channel.client);
      } catch (error) {
        // this.logger.error(error);
      }
    }

    if (secondary) {
      try {
        await secondary.delete(channel.client);
      } catch (error) {
        // this.logger.error(error);
      }
    }
  };
}

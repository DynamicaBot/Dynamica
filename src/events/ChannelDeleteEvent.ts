import Event, { EventToken } from '@/classes/Event';
import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import Logger from '@/services/Logger';
import { DMChannel, NonThreadGuildBasedChannel } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class ChannelDeleteEvent extends Event<'channelDelete'> {
  constructor(
    private logger: Logger,
    private secondaries: Secondaries,
    private primaries: Primaries
  ) {
    super();
  }

  event: 'channelDelete' = 'channelDelete';

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (
    channel: DMChannel | NonThreadGuildBasedChannel
  ) => void | Promise<void> = async (channel) => {
    if (channel.isDMBased()) return;
    if (channel.isThread()) return;

    const primary = await this.primaries.get(channel.id);
    const secondary = await this.secondaries.get(channel.id);

    if (primary) {
      try {
        await primary.delete(false);
      } catch (error) {
        this.logger.error(error);
      }
    }

    if (secondary) {
      try {
        await secondary.delete(false);
      } catch (error) {
        this.logger.error('Error deleting secondary: ', error);
      }
    }
  };
}

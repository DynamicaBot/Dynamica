import Secondaries from '@/classes/Secondaries';
import Event from '@classes/Event';
import { Presence } from 'discord.js';

export default class PresenceUpdateEvent extends Event<'presenceUpdate'> {
  constructor() {
    super('presenceUpdate');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    oldPresence: Presence,
    newPresence: Presence
  ) => void | Promise<void> = (oldPresence, newPresence) => {
    const channelId = newPresence?.member?.voice?.channelId;
    if (!channelId) {
      return;
    }
    const dynamicaSecondary = Secondaries.get(channelId);

    if (dynamicaSecondary) {
      dynamicaSecondary.update(newPresence.client);
    }
  };
}

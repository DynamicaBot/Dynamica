import Secondaries from '@/classes/Secondaries';
import Event, { EventToken } from '@classes/Event';
import { Presence } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class PresenceUpdateEvent implements Event<'presenceUpdate'> {
  constructor(private secondaries: Secondaries) {}

  event: 'presenceUpdate' = 'presenceUpdate';

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (
    oldPresence: Presence,
    newPresence: Presence
  ) => void | Promise<void> = (oldPresence, newPresence) => {
    const channelId = newPresence?.member?.voice?.channelId;
    if (!channelId) {
      return;
    }
    const dynamicaSecondary = this.secondaries.get(channelId);

    if (dynamicaSecondary) {
      dynamicaSecondary.update(newPresence.client);
    }
  };
}

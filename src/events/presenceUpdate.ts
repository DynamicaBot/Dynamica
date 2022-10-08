import Event from '@classes/Event';
import DynamicaSecondary from '@classes/Secondary';
import { Presence } from 'discord.js';

export class PresenceUpdateEvent extends Event<'presenceUpdate'> {
  constructor() {
    super('presenceUpdate');
  }

  public response: (
    oldPresence: Presence,
    newPresence: Presence
  ) => void | Promise<void> = (oldPresence, newPresence) => {
    const { channelId } = newPresence.member.voice;
    if (!channelId) {
      return;
    }
    const dynamicaSecondary = DynamicaSecondary.get(channelId);

    if (dynamicaSecondary) {
      dynamicaSecondary.update(newPresence.client);
    }
  };
}

import Event from '@classes/Event';
import DynamicaSecondary from '@classes/Secondary';
import { Presence } from 'discord.js';

export default new Event<'presenceUpdate'>()
  .setOnce(false)
  .setEvent('presenceUpdate')
  .setResponse(async (oldPresence: Presence, newPresence: Presence) => {
    const { channelId } = newPresence.member.voice;
    if (!channelId) {
      return;
    }
    const dynamicaSecondary = DynamicaSecondary.get(channelId);

    if (dynamicaSecondary) {
      dynamicaSecondary.update(newPresence.client);
    }
  });

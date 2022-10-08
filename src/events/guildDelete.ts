import DynamicaGuild from '@/classes/Guild';
import { MQTT } from '@/classes/MQTT';
import Event from '@classes/Event';

export default new Event<'guildDelete'>()
  .setOnce(false)
  .setEvent('guildDelete')
  .setResponse(async (guild) => {
    const foundGuild = DynamicaGuild.get(guild.id);
    if (foundGuild) {
      await foundGuild.leave(guild.client);
    }
    const mqtt = MQTT.getInstance();
    mqtt?.publish('dynamica/event/leave', {
      guild: {
        id: guild.id,
        name: guild.name,
      },
    });
  });

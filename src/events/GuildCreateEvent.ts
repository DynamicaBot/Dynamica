import DynamicaGuild from '@/classes/Guild';
import Event, { EventToken } from '@classes/Event';
import { Guild } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class GuildCreateEvent implements Event<'guildCreate'> {
  event: 'guildCreate' = 'guildCreate';

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    await DynamicaGuild.initialise(guild);
  };
}

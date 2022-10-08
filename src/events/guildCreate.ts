import DynamicaGuild from '@/classes/Guild';
import Event from '@classes/Event';
import { Guild } from 'discord.js';

export default class GuildCreateEvent extends Event<'guildCreate'> {
  constructor() {
    super('guildCreate');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    await DynamicaGuild.initialise(guild);
  };
}

import Guilds from '@/classes/Guilds';
import Event from '@classes/Event';
import { Guild } from 'discord.js';

export default class GuildDeleteEvent extends Event<'guildDelete'> {
  constructor() {
    super('guildDelete');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    const foundGuild = Guilds.get(guild.id);
    if (foundGuild) {
      await foundGuild.leave(guild.client);
    }
  };
}

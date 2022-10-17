import Guilds from '@/classes/Guilds';
import Event, { EventToken } from '@/classes/Event';
import { Guild } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class GuildDeleteEvent extends Event<'guildDelete'> {
  constructor(private guilds: Guilds) {
    super();
  }

  event: 'guildDelete' = 'guildDelete';

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    const foundGuild = await this.guilds.get(guild.id);
    if (foundGuild) {
      await foundGuild.leave(false);
    }
  };
}

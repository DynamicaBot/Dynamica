import Guilds from '@/classes/Guilds';
import Event, { EventToken } from '@/classes/Event';
import { Guild } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class GuildCreateEvent extends Event<'guildCreate'> {
  constructor(private guilds: Guilds) {
    super();
  }

  event = 'guildCreate' as const;

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    await this.guilds.initialise(guild);
  };
}

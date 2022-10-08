import DynamicaGuild from '@/classes/Guild';
import { Event } from '@classes/Event';
import { Guild } from 'discord.js';
/**
 * The list of basic commands to display.
 */
const basicCommands: {
  /**
   * The name of the command.
   */
  command: string;
  /**
   * The link to the help page of the command.
   */
  help: string;
  /**
   * The description of the command.
   */
  description: string;
}[] = [
  {
    command: '/help',
    help: 'https://dynamica.dev/docs/commands/help',
    description: 'Get a list of commands and their descriptions',
  },
  {
    command: '/invite',
    help: 'https://dynamica.dev/docs/commands/invite',
    description: 'Get an invite link for the bot',
  },
  {
    command: '/create',
    help: 'https://dynamica.dev/docs/commands/create',
    description: 'Create a new channel for people to join',
  },
  {
    command: '/alias',
    help: 'https://dynamica.dev/docs/commands/alias',
    description: 'Create a new alias for an activity',
  },
];

export class GuildCreateEvent extends Event<'guildCreate'> {
  constructor() {
    super('guildCreate');
  }

  public response: (guild: Guild) => void | Promise<void> = async (guild) => {
    await DynamicaGuild.initialise(guild);
  };
}

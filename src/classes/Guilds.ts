import { Service } from 'typedi';
import DB from '@/services/DB';
import Client from '@/services/Client';
import Logger from '@/services/Logger';
import { EmbedBuilder, Guild, hyperlink } from 'discord.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import MQTT from '../services/MQTT';
import type GuildFactory from './GuildFactory';

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

const commands = basicCommands
  .map(
    (command) =>
      `${hyperlink(`\`${command.command}\``, command.help)} - ${
        command.description
      }`
  )
  .join('\n');

const botInfoEmbed = new EmbedBuilder()
  .setTitle('Welcome to Dynamica!')
  .setDescription(
    'Dynamica is a Discord bot that allows you to manage voice channels in your server with ease.\n'
  )
  .addFields([
    { name: 'Basic Commands', value: commands },
    {
      name: 'Website',
      value:
        'Maybe you know this already but you can find out more about Dynamica at [dynamica.dev](https://dynamica.dev) including more commands.',
    },
    {
      name: 'Support',
      value:
        'If you have any questions or issues, you can join the [support server](https://discord.gg/zs892m6btf).',
    },
  ])

  .setAuthor({
    name: 'Dynamica',
    iconURL: 'https://dynamica.dev/img/dynamica.png',
  });

@Service()
export default class Guilds {
  constructor(
    private mqtt: MQTT,
    private db: DB,
    private guildFactory: GuildFactory,
    private client: Client,
    private logger: Logger
  ) {}

  public async remove(guildId: string) {
    await this.db.guild.delete({
      where: {
        id: guildId,
      },
    });
  }

  public async get(guildId: string) {
    const existingGuild = await this.db.guild.findUnique({
      where: {
        id: guildId,
      },
    });

    if (!existingGuild) {
      return null;
    }
    return this.guildFactory.create(guildId);
  }

  public get count() {
    return this.db.guild.count();
  }

  public async initialise(guild: Guild) {
    const owner = await guild.fetchOwner();
    if (!guild.members.me.permissions.has('Administrator')) {
      await owner.send(
        `Hi there, I see you tried to invite me into your server. To make sure that the bot works correctly please allow it to have admin permissions and then re-invite it.\n\nIf you need more info as to why the bot needs admin go ${hyperlink(
          'here',
          'https://dynamica.dev/docs/faq#why-does-this-random-bot-need-admin'
        )}.`
      );
      await guild.leave();

      throw new Error('Missing admin permissions');
    }

    // Attempt to send a message in the announcements channel
    try {
      await owner.send({
        embeds: [botInfoEmbed],
      });
    } catch (error) {
      this.logger.debug('Failed to send owner welcome message.');
    }

    try {
      await this.db.guild.create({
        data: {
          id: guild.id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.debug('Guild already exists in database');
        }
      } else {
        this.logger.error('Error creating guild in database:', error);
      }
    }

    this.logger.debug(`Joined guild ${guild.id} named: ${guild.name}`);
    const newGuild = await this.guildFactory.create(guild.id);
    return newGuild;
  }
}

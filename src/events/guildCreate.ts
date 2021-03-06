import Event from '@classes/event';
import db from '@db';
import { hyperlink } from '@discordjs/builders';
import logger from '@utils/logger';
import { MessageEmbed } from 'discord.js';
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

const botInfoEmbed = new MessageEmbed()
  .setTitle('Welcome to Dynamica!')
  .setDescription(
    'Dynamica is a Discord bot that allows you to manage voice channels in your server with ease.\n'
  )
  .addField('Basic Commands', commands, false)
  .addField(
    'Website',

    'Maybe you know this already but you can find out more about Dynamica at [dynamica.dev](https://dynamica.dev) including more commands.'
  )
  .addField(
    'Support',

    'If you have any questions or issues, you can join the [support server](https://discord.gg/zs892m6btf).'
  )
  .setAuthor({
    name: 'Dynamica',
    iconURL: 'https://dynamica.dev/img/dynamica.png',
  });

export default new Event<'guildCreate'>()
  .setOnce(false)
  .setEvent('guildCreate')
  .setResponse(async (guild) => {
    if (!guild.me.permissions.has('ADMINISTRATOR')) {
      const owner = await guild.fetchOwner();
      owner.send(
        `Hi there, I see you tried to invite me into your server. To make sure that the bot works correctly please allow it to have admin permissions and then re-invite it.\n\nIf you need more info as to why the bot needs admin go ${hyperlink(
          'here',
          'https://dynamica.dev/docs/faq#why-does-this-random-bot-need-admin'
        )}.`
      );
      await guild.leave();
    } else {
      if (guild.systemChannel) {
        guild.systemChannel.send({
          embeds: [botInfoEmbed],
        });
      }
      try {
        const role = await guild.roles.create({
          name: 'Dynamica',
          color: '#4791FF',
          permissions: ['ADMINISTRATOR'],
          icon:
            guild.premiumTier === 'TIER_2' || guild.premiumTier === 'TIER_3'
              ? 'https://dynamica.dev/img/dynamica.png'
              : undefined,
        });

        await db.guild.create({
          data: {
            id: guild.id,
            managerRoleId: role.id,
          },
        });
        guild.fetchOwner().then((owner) => {
          owner.roles.add(role);
        });
      } catch (error) {
        logger.error('Updated guild per-command permissions', error.toString());
      }

      logger.debug(`Joined guild ${guild.id} named: ${guild.name}`);
    }
  });

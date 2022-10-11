import { ErrorEmbed } from '@/utils/discordEmbeds';
import logger from '@/utils/logger';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import type Command from './Command';
import ConditionError from './ConditionError';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

// Report error button
const errorRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
  new ButtonBuilder()
    .setLabel('Report Error')
    .setURL('https://github.com/DynamicaBot/Dynamica/issues')
    .setStyle(ButtonStyle.Link),
]);

export default class Commands {
  public static commands: Record<string, Command> = {};

  public static register(command: Command): void {
    Commands.commands[command.name] = command;
  }

  public static get(name: string): Command | undefined {
    return Commands.commands[name];
  }

  public static get count(): number {
    return Object.keys(Commands.commands).length;
  }

  public static get all(): Command[] {
    return Object.values(Commands.commands);
  }

  public static get names(): string[] {
    return Object.keys(Commands.commands);
  }

  public static get data(): SlashCommandBuilderTypes[] {
    return Commands.all.map((command) => command.data);
  }

  public static get json(): RESTPostAPIApplicationCommandsJSONBody[] {
    return Commands.all.map((command) => command.data.toJSON());
  }

  public static run = async (
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> => {
    const command = Commands.get(interaction.commandName);
    if (!command) return;

    try {
      await Promise.all(
        command.conditions.map((condition) => condition.check(interaction))
      );
    } catch (error) {
      if (error instanceof ConditionError) {
        interaction.reply({
          // content: `Error: ${error.message}`,
          components: [errorRow],
          ephemeral: true,
          embeds: [
            ErrorEmbed(error.message).setFooter({
              text: 'If you think this is an error please report it by clicking the button below.',
            }),
          ],
        });
      } else {
        interaction.reply({
          embeds: [
            ErrorEmbed(error.message).setFooter({
              text: 'If you think this is an error please report it by clicking the button below.',
            }),
          ],
          components: [errorRow],
        });
      }

      return;
    }
    try {
      await command.response(interaction);
    } catch (error) {
      logger.error(`Error while running command ${command.name}`, error);
      interaction.reply({
        embeds: [
          ErrorEmbed(
            'An unknown error has occured. Please file a bug report using the link below.'
          ),
        ],
        components: [errorRow],
      });
    }
  };
}

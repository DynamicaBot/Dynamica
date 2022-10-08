import { ErrorEmbed } from '@/utils/discordEmbeds';
import {
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
          ephemeral: true,
          embeds: [ErrorEmbed(error.message)],
        });
      }
      return;
    }

    await command.response(interaction);
  };
}

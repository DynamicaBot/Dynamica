import { ErrorEmbed } from '@/utils/discordEmbeds';
import signaleLogger from '@/utils/logger';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import {
  CacheType,
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { Signale } from 'signale';
import Condition from './Condition';
import { ConditionError } from './ConditionError';
import { MQTT } from './MQTT';

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

/**
 * The command class for defining new Dynamica commands.
 */
export class Command {
  public name: string;

  public logger: Signale;

  public data: SlashCommandBuilderTypes;

  public conditions: Condition[] = [];

  public response: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;

  constructor(name: string) {
    this.logger = signaleLogger.scope('Command', name);
    this.name = name;
  }

  public publish = (data: any) => {
    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/command/${this.name}`, data);
  };
}

export class Commands {
  public static commands: Record<string, Command> = {};

  public static register(command: Command): void {
    Commands.commands[command.name] = command;
  }

  public static get(name: string): Command | undefined {
    return Commands.commands[name];
  }

  public static has(name: string): boolean {
    return Commands.commands.hasOwnProperty(name);
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

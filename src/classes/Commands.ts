import { ErrorEmbed } from '@/utils/discordEmbeds';
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
import { Service } from 'typedi';
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

@Service()
export default class Commands {
  constructor(private commands: Record<string, Command> = {}) {}

  public register(command: Command): void {
    this.commands[command.name] = command;
  }

  public registerMany(commands: Command[]): void {
    commands.forEach((command) => this.register(command));
  }

  public get(name: string): Command | undefined {
    return this.commands[name];
  }

  public get count(): number {
    return Object.keys(this.commands).length;
  }

  public get all(): Command[] {
    return Object.values(this.commands);
  }

  public get names(): string[] {
    return Object.keys(this.commands);
  }

  public get data(): SlashCommandBuilderTypes[] {
    return this.all.map((command) => command.data);
  }

  public get json(): RESTPostAPIApplicationCommandsJSONBody[] {
    return this.all.map((command) => command.data.toJSON());
  }

  public run = async (
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> => {
    const command = this.get(interaction.commandName);
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
      // logger.error(`Error while running command ${command.name}`, error);
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

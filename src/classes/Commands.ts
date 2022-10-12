import { ErrorEmbed } from '@/utils/discordEmbeds';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Service } from 'typedi';
import type Command from './Command';
import ConditionError from './ConditionError';

// Report error button
const errorRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
  new ButtonBuilder()
    .setLabel('Report Error')
    .setURL('https://github.com/DynamicaBot/Dynamica/issues')
    .setStyle(ButtonStyle.Link),
]);

@Service()
export default class Commands {
  private commands: Record<string, Command> = {};

  public register(command: Command): void {
    this.commands[command.name] = command;
    // console.log(this.commands);
  }

  public registerMany(commands: Command[]): void {
    commands.forEach((command) => this.register(command));
  }

  public get(name: string): Command | undefined {
    return this.commands[name];
  }

  public count(): number {
    return Object.keys(this.commands).length;
  }

  public all(): Command[] {
    return Object.values(this.commands);
  }

  public get names(): string[] {
    return Object.keys(this.commands);
  }

  public data = () =>
    Object.values(this.commands).map((command) => command.data.toJSON());

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

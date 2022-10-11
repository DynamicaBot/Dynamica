import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import Logger from '@/utils/logger';
import Discord, {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class VersionCommand implements Command {
  constructor(private logger: Logger) {}

  conditions: Condition[] = [];

  name = 'version';

  data = new SlashCommandBuilder()
    .setName('version')
    .setDescription('The version of the bot in use.');

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    interaction.reply({
      ephemeral: true,
      content: `The version of the bot is \`${process.env.VERSION}\`.\nThe discord.js version is \`${Discord.version}\`.`,
    });
  };
}

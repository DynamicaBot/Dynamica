import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import Logger from '@/services/Logger';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class PingCommand implements Command {
  constructor(private logger: Logger) {}

  conditions: Condition[] = [];

  name = 'ping';

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
  };

  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
}

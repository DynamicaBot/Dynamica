import Command from '@/classes/Command';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class PingCommand extends Command {
  constructor() {
    super('ping');
  }

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

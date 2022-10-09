import Command from '@/classes/Command';
import interactionDetails from '@/utils/mqtt';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class PingCommand extends Command {
  constructor() {
    super('ping');
  }

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
    this.publish({
      ...interactionDetails(interaction),
    });
  };

  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
}

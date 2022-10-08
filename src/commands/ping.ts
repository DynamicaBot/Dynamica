import { Command } from '@/classes/Command';
import { MQTT } from '@/classes/MQTT';
import { interactionDetails } from '@/utils/mqtt';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export class PingCommand extends Command {
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
    const mqtt = MQTT.getInstance();
    this.publish({
      ...interactionDetails(interaction),
    });
  };

  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
}

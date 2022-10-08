import { MQTT } from '@/classes/MQTT';
import help from '@/help/ping';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  await interaction.reply({
    content: `Pong from JavaScript! Bot Latency ${Math.round(
      interaction.client.ws.ping
    )}ms.`,
    ephemeral: true,
  });
  const mqtt = MQTT.getInstance();
  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    ...interactionDetails(interaction),
  });
};

export const ping = new Command({ data, response, help });

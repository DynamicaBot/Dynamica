import help from '@/help/ping';
import Command from '@classes/command';
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
};

export const ping = new Command({ data, response, help });

import { MQTT } from '@/classes/MQTT';
import help from '@/help/version';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CacheType, ChatInputCommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('version')
  .setDescription('The version of the bot in use.');

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const mqtt = MQTT.getInstance();
  interaction.reply({
    ephemeral: true,
    content: `The version of the bot is \`${process.env.VERSION}\`.\nThe discord.js version is \`${Discord.version}\`.`,
  });
  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    bot: process.env.VERSION,
    discordjs: Discord.version,
    ...interactionDetails(interaction),
  });
};

export const version = new Command({ help, data, response });

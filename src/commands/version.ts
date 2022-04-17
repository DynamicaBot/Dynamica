import help from '@/help/version';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
export default new Command()
  .setCommandData(
    new SlashCommandBuilder()
      .setName('version')
      .setDescription('The version of the bot in use.')
  )
  .setHelp(help)
  .setResponse(async (interaction) => {
    interaction.reply({
      ephemeral: true,
      content: `The version of the bot is \`${process.env.VERSION}\`.\nThe discord.js version is \`${Discord.version}\`.`,
    });
  });
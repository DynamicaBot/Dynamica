import help from '@/help/ping';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command()
  .setCommandData(
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!')
  )
  .setHelp(help)
  .setResponse(async (interaction) => {
    await interaction.reply({
      content: `Pong from JavaScript! Bot Latency ${Math.round(
        interaction.client.ws.ping
      )}ms.`,
      ephemeral: true,
    });
  });

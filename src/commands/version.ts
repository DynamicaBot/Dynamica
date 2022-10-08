import Command from '@/classes/Command';
import MQTT from '@/classes/MQTT';
import interactionDetails from '@/utils/mqtt';
import Discord, {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class VersionCommand extends Command {
  constructor() {
    super('version');
  }

  data = new SlashCommandBuilder()
    .setName('version')
    .setDescription('The version of the bot in use.');

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
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
}

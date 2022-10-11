import db from '@db';
import logger from '@utils/logger';
import { Client, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';
import Events from './classes/Events';
import registerAutocompletes from './register-autocomples';
import registerCommands from './register-commands';
import registerEvents from './register-events';
import registerHelp from './register-help';

dotenv.config();

const intents = new IntentsBitField().add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildVoiceStates,
  IntentsBitField.Flags.GuildPresences
);
/**
 * DiscordJS Client instance
 */
const client = new Client({
  intents,
});

registerCommands();
registerHelp();
registerEvents();
registerAutocompletes();

try {
  /**
   * Register Events
   */
  Events.all.forEach((event) => {
    client[event.once ? 'once' : 'on'](event.event, event.response);
  });

  /** Login */
  client.login(process.env.TOKEN);
} catch (error) {
  logger.error('Login Error', error);
}

// Handle stop signal
process.on('SIGINT', () => {
  client.destroy();
  db.$disconnect();
  logger.info('Bot Stopped');
});

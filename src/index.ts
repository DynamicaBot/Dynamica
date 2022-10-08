import db from '@db';
import logger from '@utils/logger';
import { Client, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';
import rl from 'readline';
import { Events } from './classes/Event';
import { RegisterCommands } from './register-commands';
import { RegisterEvents } from './register-events';
import { RegisterHelp } from './register-help';
import deploy from './scripts/deploy';
import remove from './scripts/remove';

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

new RegisterCommands();
new RegisterHelp();
new RegisterEvents();

/**
 * Some of the commandline stuff to read
 */
(async () => {
  const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  for await (const line of readline) {
    // logger.log(line)
    switch (line) {
      case 'deploy':
        await deploy();
        break;
      case 'remove':
        await remove();
        break;
      default:
        logger.log('Unknown command');
        break;
    }
  }
})();

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
  logger.error(error);
}

// Handle stop signal
process.on('SIGINT', () => {
  client.destroy();
  db.$disconnect();
  logger.info('Bot Stopped');
});

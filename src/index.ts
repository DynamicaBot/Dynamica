import 'reflect-metadata';
import dotenv from 'dotenv';
import { Container } from 'typedi';
import Logger from '@/services/Logger';
import DB from '@/services/DB';
import Client from '@/services/Client';
import Events from './classes/Events';
import registerAutocompletes from './register-autocomples';
import registerEvents from './register-events';
import registerHelp from './register-help';
import registerCommands from './register-commands';
import MQTT from './services/MQTT';

dotenv.config();

Container.import([Logger, DB, Events, Client, MQTT]);

registerCommands();
registerHelp();
registerEvents();
registerAutocompletes();

const events = Container.get(Events);
const client = Container.get(Client);
const logger = Container.get(Logger);
const db = Container.get(DB);

try {
  /**
   * Register Events
   */

  events.all.forEach((event) => {
    client[event.once ? 'once' : 'on'](event.event, event.response);
  });

  /** Login */
  client.login(process.env.TOKEN);
} catch (error) {
  logger.error('Login Error', error);
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', error);
});

// Handle stop signal
process.on('SIGINT', () => {
  client.destroy();

  db.$disconnect();
  logger.info('Bot Stopped');
});

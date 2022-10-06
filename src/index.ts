import db from '@db';
import events from '@events';
import logger from '@utils/logger';
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import rl from 'readline';
import deploy from './scripts/deploy';
import remove from './scripts/remove';

dotenv.config();

/**
 * DiscordJS Client instance
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

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

const eventList = Object.values(events);
try {
  /**
   * Register Events
   */
  eventList.forEach((event) => {
    if (event.once) {
      client.once(event.event, (...args) => event.execute(...args));
    } else {
      client.on(event.event, (...args) => event.execute(...args));
    }
  });

  /** Login */
  client.login(process.env.TOKEN);
} catch (error) {
  logger.error(error);
}

// // every 30 minutes run status
// setInterval(async () => {
//   const mqtt = MQTT.getInstance();
//   const guilds = client.guilds.cache.map((guild) => {
//     return {
//       id: guild.id,
//       name: guild.name,
//       members: guild.memberCount,
//     };
//   });
//   mqtt?.publish('dynamica/status', {
//     guilds,
//     ...(await status()),
//   });
// }, 1000 * 60 * 1);

// Handle stop signal
process.on('SIGINT', () => {
  client.destroy();
  db.$disconnect();
  logger.info('Bot Stopped');
});

export default client;

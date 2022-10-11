import Commands from '@/classes/Commands';
import registerCommands from '@/register-commands';
import { REST } from '@discordjs/rest';
import Logger from '@/services/Logger';
import { Routes } from 'discord-api-types/v10';
import { Container } from 'typedi';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
const logger = Container.get(Logger);
const deployLogger = logger.scope('Deploy');

export default async () => {
  if (!TOKEN || !CLIENT_ID) {
    logger.error('Missing env vars.');
  } else {
    deployLogger.time('deploy');

    registerCommands();
    const commands = Container.get(Commands);
    const { json: commandData } = commands;

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: commandData,
        });
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commandData,
        });
      }
    } catch (error) {
      logger.error(error);
    }
    deployLogger.timeEnd('deploy');
    process.exit();
  }
};

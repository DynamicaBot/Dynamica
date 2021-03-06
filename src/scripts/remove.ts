import { REST } from '@discordjs/rest';
import logger from '@utils/logger';
import { Routes } from 'discord-api-types/v9';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

export default async () => {
  if (!TOKEN || !CLIENT_ID) {
    logger.error('Missing env vars.');
  } else {
    const rest = new REST({ version: '9' }).setToken(TOKEN);

    try {
      logger.info(
        `Started refreshing ${GUILD_ID ? 'guild' : 'application'} (/) commands.`
      );
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: [],
        });
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: [],
        });
      }

      logger.info(
        `Successfully deleted ${
          GUILD_ID ? 'guild' : 'application'
        } (/) commands.`
      );
    } catch (error) {
      logger.error(error);
    }
  }
};

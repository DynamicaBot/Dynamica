import Event from '@classes/event';
import DynamicaPrimary from '@classes/primary';
import DynamicaSecondary from '@classes/secondary';
import db from '@db';
import updateActivityCount from '@utils';
import logger from '@utils/logger';
import { Client } from 'discord.js';

export default new Event()
  .setOnce(true)
  .setEvent('ready')
  .setResponse(async (client: Client<true>) => {
    try {
      const secondaries = await db.secondary.findMany();
      const primaries = await db.primary.findMany();

      primaries.forEach(async (element) => {
        const existingPrimary = await new DynamicaPrimary(
          client,
          element.id
        ).fetch();

        if (!existingPrimary) {
          return;
        }
        const channel = existingPrimary.discord;

        if (channel.members.size > 0) {
          const channelMembers = [...channel.members.values()];

          const secondary = new DynamicaSecondary(client);
          await secondary.create(
            existingPrimary,
            channel.guild,
            channelMembers[0]
          );
          channelMembers.slice(1).forEach((channelMember) => {
            channelMember.voice.setChannel(secondary.discord);
          });
        }
      });

      secondaries.forEach(async (element) => {
        const secondaryChannel = await new DynamicaSecondary(
          client,
          element.id
        ).fetch();

        await secondaryChannel?.update();
      });

      logger.info(`Ready! Logged in as ${client.user?.tag}`);
      updateActivityCount(client);
    } catch (error) {
      logger.error(error);
    }
  });

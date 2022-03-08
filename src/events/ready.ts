import { Client } from "discord.js";
import { Event } from "../Event";
import { db } from "../utils/db";
import { logger } from "../utils/logger";
import { updateActivityCount } from "../utils/operations/general";
import { createSecondary, editChannel } from "../utils/operations/secondary";

export const ready: Event = {
  once: true,
  event: "ready",
  async execute(client: Client<true>) {
    try {
      const activeSecondaries = await db.secondary.findMany();
      const primaries = await db.primary.findMany();
      for (let index = 0; index < primaries.length; index++) {
        const element = primaries[index];
        const channel = await client.channels.cache.get(element.id);
        if (!channel?.isVoice()) return;
        if (channel.members.size > 0) {
          const channelMembers = [...channel.members.values()];

          const secondary = await createSecondary(
            channel.guild.channels,
            element.id,
            channelMembers[0]
          );
          channelMembers.slice(1).forEach((channelMember) => {
            channelMember.voice.setChannel(secondary);
          });
        }
      }
      for (let index = 0; index < activeSecondaries.length; index++) {
        const element = activeSecondaries[index];
        const channel = await client.channels.cache.get(element.id);
        if (!channel) {
          db.secondary
            .delete({ where: { id: element.id } })
            .then((secondary) => {
              if (secondary.textChannelId) {
                client.channels.cache.get(secondary.textChannelId).delete();
              }
              logger.info(`Deleted Stale Secondary ${element.id}`);
            });

          return;
        }
        if (!channel.isVoice()) {
          logger.info(`Not a voice channel`);
          return;
        }
        logger.info(`Channel restarted ${channel.id}`);
        editChannel({ channel });
      }
      logger.info(`Ready! Logged in as ${client.user?.tag}`);
      updateActivityCount(client);
    } catch (error) {
      logger.error(error);
    }
  },
};

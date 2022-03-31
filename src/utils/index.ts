import db from "@db";
import logger from "@utils/logger";
import { Client } from "discord.js";

/**
 * Refresh Channel Activity Count
 */
export const updateActivityCount = (client: Client) => {
  return db.secondary
    .count()
    .then((count) => {
      client.user.setPresence({
        status: !!count ? "online" : "idle",
        afk: !!count,
        activities: [
          {
            type: "PLAYING",
            name: `with ${count} ${count === 1 ? "channel" : "channels"}.`,
          },
        ],
      });
    })
    .catch((error) => logger.error(error));
};

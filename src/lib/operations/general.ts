import { Client } from "discord.js";
import { prisma } from "../prisma";

/**
 * Refresh Channel Activity Count
 */
export const updateActivityCount = (client: Client) => {
  return prisma.secondary.count().then((count) => {
    client.user?.setActivity(
      `with ${count} ${count === 1 ? "channel" : "channels"}.`
    );
  });
};

import { db } from "../db.js";
import { logger } from "../logger.js";

export const updateGuild = async (guildId: string, data: any) => {
  try {
    await db.guild.update({
      data,
      where: {
        id: guildId,
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

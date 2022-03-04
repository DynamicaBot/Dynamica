import { db } from "../db";
import { logger } from "../logger";

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

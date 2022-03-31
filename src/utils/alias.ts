import db from "@db";
import logger from "@utils/logger";

/**
 * Updates or creates a new alias.
 * @param activity The activity to be aliased.
 * @param alias The alias.
 * @param guildId The guild ID.
 */
export const updateAlias = async (
  activity: string,
  alias: string,
  guildId: string
) => {
  try {
    const existingAlias = await db.alias.findFirst({
      where: {
        activity,
        guildId,
      },
    });
    if (existingAlias) {
      await db.alias.update({
        where: {
          id: existingAlias.id,
        },
        data: {
          activity,
          alias,
        },
      });
    } else {
      await db.alias.create({
        data: {
          activity,
          alias,
          guildId,
        },
      });
    }
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Deletes an alias.
 * @param activity The activity whose alias to delete.
 * @param guildId The guild ID.
 */
export const deleteAlias = async (activity: string, guildId: string) => {
  try {
    await db.alias.deleteMany({
      where: {
        activity,
        guildId,
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Lists alias in name, value format.
 * @param guildId The guild ID.
 * @returns An array of aliases.
 */
export const listAliases = async (guildId: string) => {
  try {
    const aliases = await db.alias.findMany({
      where: {
        guildId,
      },
    });
    return aliases.map((alias) => ({
      name: alias.activity,
      value: alias.alias,
    }));
  } catch (error) {
    logger.error(error);
  }
};

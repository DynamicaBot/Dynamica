import signaleLogger from '@/utils/logger';
import db from '@db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import { Signale } from 'signale';
// eslint-disable-next-line import/no-cycle
import Aliases from './Aliases';

export default class DynamicaAlias {
  public guildId: string;

  public activity: string;

  public logger: Signale;

  public static logger = signaleLogger.scope('Alias');

  constructor(guildId: string, activity: string) {
    this.guildId = guildId;
    this.activity = activity;
    this.logger = signaleLogger.scope('Alias', guildId, activity);
  }

  /**
   * Fetches the alias.
   * @returns this
   */
  prisma() {
    return db.alias.findUniqueOrThrow({
      where: {
        guildId_activity: {
          activity: this.activity,
          guildId: this.guildId,
        },
      },
    });
  }

  /**
   * Create a new alias
   * @param data The alias and activity to create.
   * @returns this
   * TODO: Add a check to see if the alias already exists.
   */
  public static async create(guildId: string, activity: string, alias: string) {
    try {
      const newAlias = await db.alias.create({
        data: {
          guildId,
          activity,
          alias,
        },
      });
      const aliasInstance = new DynamicaAlias(newAlias.guildId, activity);
      Aliases.add(aliasInstance);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('An alias with that name already exists.');
        } else {
          this.logger.error('An unknown Prisma Error occured', error);
          throw new Error('An unknown error occured.');
        }
      }
    }
  }

  async update(alias: string, activity: string) {
    const dbAlias = await db.alias.update({
      where: {
        guildId_activity: {
          activity,
          guildId: this.guildId,
        },
      },
      data: {
        alias,
        activity,
      },
    });

    const newAlias = new DynamicaAlias(dbAlias.guildId, dbAlias.activity);
    Aliases.update(activity, this.guildId, newAlias);
  }

  /**
   * Delete the chosen alias.
   */
  async delete() {
    await db.alias.delete({
      where: {
        guildId_activity: {
          activity: this.activity,
          guildId: this.guildId,
        },
      },
    });
    Aliases.remove(this.activity, this.guildId);
  }
}

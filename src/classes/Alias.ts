import logger from '@/utils/normalLogger';
import DB from '@db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import { Service, Container } from 'typedi';
// eslint-disable-next-line import/no-cycle
import Aliases from './Aliases';
// eslint-disable-next-line import/no-cycle
import AliasFactory from './AliasFactory';

@Service({ factory: [AliasFactory, 'create'] })
export default class DynamicaAlias {
  public guildId: string;

  public activity: string;

  constructor(guildId: string, activity: string, private db: DB) {
    this.guildId = guildId;
    this.activity = activity;
  }

  /**
   * Fetches the alias.
   * @returns this
   */
  prisma() {
    return this.db.alias.findUniqueOrThrow({
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
    const aliases = Container.get(Aliases);
    const db = Container.get(DB);
    try {
      const newAlias = await db.alias.create({
        data: {
          guildId,
          activity,
          alias,
        },
      });
      const aliasFactory = Container.get(AliasFactory);
      const aliasInstance = aliasFactory.create(newAlias.guildId, activity);
      aliases.add(aliasInstance);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('An alias with that name already exists.');
        } else {
          logger.error('An unknown Prisma Error occured', error);
          throw new Error('An unknown error occured.');
        }
      }
    }
  }

  async update(alias: string, activity: string) {
    const aliases = Container.get(Aliases);
    const dbAlias = await this.db.alias.update({
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
    const aliasFactory = Container.get(AliasFactory);
    const newAlias = aliasFactory.create(dbAlias.guildId, dbAlias.activity);
    aliases.update(activity, this.guildId, newAlias);
  }

  /**
   * Delete the chosen alias.
   */
  async delete() {
    const aliases = Container.get(Aliases);
    await this.db.alias.delete({
      where: {
        guildId_activity: {
          activity: this.activity,
          guildId: this.guildId,
        },
      },
    });
    aliases.remove(this.activity, this.guildId);
  }
}

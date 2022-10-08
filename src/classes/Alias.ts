import db from '@db';
// eslint-disable-next-line import/no-cycle
import Aliases from './Aliases';

export default class DynamicaAlias {
  public guildId: string;

  public id: number;

  constructor(guildId: string, id: number) {
    this.guildId = guildId;
    this.id = id;
  }

  /**
   * Fetches the alias.
   * @returns this
   */
  prisma() {
    return db.alias.findUniqueOrThrow({ where: { id: this.id } });
  }

  /**
   * Create a new alias
   * @param data The alias and activity to create.
   * @returns this
   * TODO: Add a check to see if the alias already exists.
   */
  public static async findOrCreate(
    guildId: string,
    activity: string,
    alias: string
  ) {
    // const { alias, activity } = data;

    const dbAlias = await db.alias.upsert({
      create: {
        activity,
        alias,
        guildId,
      },
      update: {
        activity,
        alias,
      },
      where: {
        guildId_activity: {
          activity,
          guildId,
        },
      },
    });
    const newAlias = new DynamicaAlias(dbAlias.guildId, dbAlias.id);
    Aliases.add(newAlias);
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
    const newAlias = new DynamicaAlias(dbAlias.guildId, dbAlias.id);
    Aliases.add(newAlias);
  }

  /**
   * Delete the chosen alias.
   */
  async delete() {
    if (!this.id) {
      throw new Error('No Id defined');
    }
    await db.alias.delete({ where: { id: this.id } });
  }
}

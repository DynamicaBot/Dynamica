import db from '@db';

export default class DynamicaAlias {
  public static aliases: DynamicaAlias[] = [];

  private guildId: string;

  private id: number;

  public static add(alias: DynamicaAlias) {
    if (DynamicaAlias.has(alias.id)) return;
    this.aliases.push(alias);
  }

  public static remove(id: number) {
    this.aliases = this.aliases.filter((alias) => alias.id !== id);
  }

  public static get(id: number | undefined) {
    return this.aliases.find((alias) => alias.id === id);
  }

  public static has = (id: number) =>
    this.aliases.some((alias) => alias.id === id);

  public static getByGuildId(guildId: string) {
    return this.aliases.filter((alias) => alias.guildId === guildId);
  }

  static get count() {
    return this.aliases.length;
  }

  constructor(guildId: string, id: number) {
    this.guildId = guildId;
    this.id = id;
    DynamicaAlias.add(this);
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
   */
  public static async findOrCreate(
    guildId: string,
    activity: string,
    alias: string
  ): Promise<DynamicaAlias> {
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

    return new DynamicaAlias(dbAlias.guildId, dbAlias.id);
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

    return new DynamicaAlias(dbAlias.guildId, dbAlias.id);
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

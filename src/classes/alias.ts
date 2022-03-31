import db from '@db';

export default class DynamicaAlias {
  private guildId: string;

  private id: number;

  public activity: string;

  public alias: string;

  constructor(guildId: string, id?: number) {
    this.guildId = guildId;
    if (id) {
      this.id = id;
      this.fetch();
    }
  }

  /**
   * Fetches the alias.
   * @returns this
   */
  async fetch() {
    if (!this.id) {
      throw new Error('No Id defined');
    }
    const alias = await db.alias.findUnique({ where: { id: this.id } });
    this.activity = alias.activity;
    this.alias = alias.alias;
    return this;
  }

  /**
   * Create a new alias
   * @param data The alias and activity to create.
   * @returns this
   */
  async create(data: {
    alias: string;
    activity: string;
  }): Promise<DynamicaAlias> {
    const { alias, activity } = data;
    const dbAlias = await db.alias.create({
      data: { alias, activity, guildId: this.guildId },
    });

    this.alias = dbAlias.alias;
    this.activity = dbAlias.activity;
    this.id = dbAlias.id;

    return this;
  }

  /**
   * Update the alias.
   * @param id The Id of the alias to update.
   * @param data The different things to update.
   * @returns this
   */
  async update(data: { alias: string; activity: string }) {
    if (!this.id) {
      throw new Error('No Id defined');
    }

    const { alias, activity } = data;
    const dbAlias = await db.alias.update({
      data: {
        activity,
        alias,
      },
      where: { id: this.id },
    });

    this.activity = dbAlias.activity;
    this.alias = dbAlias.alias;

    return this;
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

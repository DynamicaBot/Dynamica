import type DynamicaAlias from './Alias';

export default class Aliases {
  private static aliases: DynamicaAlias[] = [];

  public static add(alias: DynamicaAlias) {
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
}

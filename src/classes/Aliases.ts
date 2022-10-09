import type DynamicaAlias from './Alias';

export default class Aliases {
  private static aliases: DynamicaAlias[] = [];

  public static add(alias: DynamicaAlias) {
    this.aliases.push(alias);
  }

  public static remove(activity: string, guildId: string) {
    this.aliases = this.aliases.filter(
      (alias) => !(alias.activity === activity && alias.guildId === guildId)
    );
  }

  public static get(activity: string, guildId: string) {
    return this.aliases.find(
      (alias) => alias.activity === activity && alias.guildId === guildId
    );
  }

  public static getByGuildId(guildId: string) {
    return this.aliases.filter((alias) => alias.guildId === guildId);
  }

  static get count() {
    return this.aliases.length;
  }

  public static update(
    activity: string,
    guildId: string,
    newAlias: DynamicaAlias
  ) {
    const aliasIndex = this.aliases.findIndex(
      (alias) => alias.activity === activity && alias.guildId === guildId
    );
    this.aliases[aliasIndex] = newAlias;
  }
}

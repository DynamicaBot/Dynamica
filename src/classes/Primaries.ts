import type DynamicaPrimary from './Primary';

export default class Primaries {
  public static primaries: DynamicaPrimary[] = [];

  public static add(primary: DynamicaPrimary) {
    this.primaries.push(primary);
  }

  public static remove(id: string) {
    this.primaries = this.primaries.filter((primary) => primary.id !== id);
  }

  public static get(id: string | undefined) {
    return this.primaries.find((primary) => primary.id === id);
  }

  public static has = (id: string) =>
    this.primaries.some((primary) => primary.id === id);

  public static getByGuildId(guildId: string) {
    return this.primaries.filter((primary) => primary.guildId === guildId);
  }

  static get count() {
    return this.primaries.length;
  }
}

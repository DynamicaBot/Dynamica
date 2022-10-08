import type DynamicaGuild from './Guild';

export default class Guilds {
  private static guilds: DynamicaGuild[] = [];

  public static getGuilds(): DynamicaGuild[] {
    return this.guilds;
  }

  public static add(guild: DynamicaGuild) {
    this.guilds.push(guild);
  }

  public static remove(guildId: string) {
    this.guilds = this.guilds.filter((guild) => guild.id !== guildId);
  }

  public static get(guildId: string) {
    return this.guilds.find((guild) => guild.id === guildId);
  }

  public static has(guildId: string) {
    return this.guilds.some((guild) => guild.id === guildId);
  }

  public static get count() {
    return this.guilds.length;
  }
}

import { Service } from 'typedi';
import type DynamicaGuild from './Guild';
import MQTT from './MQTT';

@Service()
export default class Guilds {
  constructor(private mqtt: MQTT) {}

  private guilds: DynamicaGuild[] = [];

  public getGuilds(): DynamicaGuild[] {
    return this.guilds;
  }

  public add(guild: DynamicaGuild) {
    this.guilds.push(guild);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/guilds', this.guilds.length.toString());
    }
  }

  public remove(guildId: string) {
    this.guilds = this.guilds.filter((guild) => guild.id !== guildId);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/guilds', this.guilds.length.toString());
    }
  }

  public get(guildId: string) {
    return this.guilds.find((guild) => guild.id === guildId);
  }

  public has(guildId: string) {
    return this.guilds.some((guild) => guild.id === guildId);
  }

  public get count() {
    return this.guilds.length;
  }
}

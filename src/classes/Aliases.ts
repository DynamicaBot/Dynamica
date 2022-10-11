import { Service } from 'typedi';
import type DynamicaAlias from './Alias';
import MQTT from '../services/MQTT';

@Service()
export default class Aliases {
  constructor(private mqtt: MQTT) {}

  private aliases: DynamicaAlias[] = [];

  public add(alias: DynamicaAlias) {
    this.aliases.push(alias);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/aliases', this.aliases.length.toString());
    }
  }

  public remove(activity: string, guildId: string) {
    this.aliases = this.aliases.filter(
      (alias) => !(alias.activity === activity && alias.guildId === guildId)
    );
    if (this.mqtt) {
      this.mqtt.publish('dynamica/aliases', this.aliases.length.toString());
    }
  }

  public get(activity: string, guildId: string) {
    return this.aliases.find(
      (alias) => alias.activity === activity && alias.guildId === guildId
    );
  }

  public getByGuildId(guildId: string) {
    return this.aliases.filter((alias) => alias.guildId === guildId);
  }

  get count() {
    return this.aliases.length;
  }

  public update(activity: string, guildId: string, newAlias: DynamicaAlias) {
    const aliasIndex = this.aliases.findIndex(
      (alias) => alias.activity === activity && alias.guildId === guildId
    );
    this.aliases[aliasIndex] = newAlias;
  }
}

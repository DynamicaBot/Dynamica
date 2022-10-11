import { Service } from 'typedi';
import MQTT from './MQTT';
import type DynamicaPrimary from './Primary';

@Service()
export default class Primaries {
  constructor(private mqtt: MQTT) {}

  public primaries: DynamicaPrimary[] = [];

  public add(primary: DynamicaPrimary) {
    this.primaries.push(primary);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/primaries', this.primaries.length.toString());
    }
  }

  public remove(id: string) {
    this.primaries = this.primaries.filter((primary) => primary.id !== id);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/primaries', this.primaries.length.toString());
    }
  }

  public get(id: string | undefined) {
    return this.primaries.find((primary) => primary.id === id);
  }

  public has = (id: string) =>
    this.primaries.some((primary) => primary.id === id);

  public getByGuildId(guildId: string) {
    return this.primaries.filter((primary) => primary.guildId === guildId);
  }

  get count() {
    return this.primaries.length;
  }
}

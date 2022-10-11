import { Service } from 'typedi';
import MQTT from '../services/MQTT';
import type DynamicaSecondary from './Secondary';

@Service()
export default class Secondaries {
  constructor(private mqtt: MQTT) {}

  public secondaries: DynamicaSecondary[] = [];

  public add(secondary: DynamicaSecondary) {
    this.secondaries.push(secondary);
    if (this.mqtt) {
      this.mqtt.publish(
        'dynamica/secondaries',
        this.secondaries.length.toString()
      );
    }
  }

  public remove(id: string) {
    this.secondaries = this.secondaries.filter(
      (secondary) => secondary.id !== id
    );
    if (this.mqtt) {
      this.mqtt.publish(
        'dynamica/secondaries',
        this.secondaries.length.toString()
      );
    }
  }

  public get(id: string) {
    return this.secondaries.find((secondary) => secondary.id === id);
  }

  public has = (id: string) =>
    this.secondaries.some((secondary) => secondary.id === id);

  public getByGuildId(guildId: string) {
    return this.secondaries.filter(
      (secondary) => secondary.guildId === guildId
    );
  }

  public get count() {
    return this.secondaries.length;
  }
}

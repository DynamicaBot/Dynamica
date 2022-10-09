import MQTT from './MQTT';
import type DynamicaSecondary from './Secondary';

export default class Secondaries {
  public static secondaries: DynamicaSecondary[] = [];

  public static mqtt = MQTT.getInstance();

  public static add(secondary: DynamicaSecondary) {
    this.secondaries.push(secondary);
    if (this.mqtt) {
      this.mqtt.publish(
        'dynamica/secondaries',
        this.secondaries.length.toString()
      );
    }
  }

  public static remove(id: string) {
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

  public static get(id: string) {
    return this.secondaries.find((secondary) => secondary.id === id);
  }

  public static has = (id: string) =>
    this.secondaries.some((secondary) => secondary.id === id);

  public static getByGuildId(guildId: string) {
    return this.secondaries.filter(
      (secondary) => secondary.guildId === guildId
    );
  }

  public static get count() {
    return this.secondaries.length;
  }
}

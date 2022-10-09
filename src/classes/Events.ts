import { Client, ClientEvents } from 'discord.js';
import type Event from './Event';
import MQTT from './MQTT';

export default class Events {
  public static events: Event<keyof ClientEvents>[] = [];

  public static mqtt = MQTT.getInstance();

  public static register(event: Event<keyof ClientEvents>): void {
    this.events.push(event);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/events', this.events.length.toString());
    }
  }

  public static registerListeners(client: Client<false>): void {
    this.events.forEach((event) =>
      client[event.once ? 'once' : 'on'](event.event, event.response)
    );
  }

  static get all(): Event<keyof ClientEvents>[] {
    return Events.events;
  }
}

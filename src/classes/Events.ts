import { Client, ClientEvents } from 'discord.js';
import { Service } from 'typedi';
import type Event from './Event';
import MQTT from './MQTT';

@Service()
export default class Events {
  constructor(private mqtt: MQTT) {}

  private events: Event<keyof ClientEvents>[] = [];

  public register(event: Event<keyof ClientEvents>): void {
    this.events.push(event);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/events', this.events.length.toString());
    }
  }

  public registerListeners(client: Client<false>): void {
    this.events.forEach((event) =>
      client[event.once ? 'once' : 'on'](event.event, event.response)
    );
  }

  get all(): Event<keyof ClientEvents>[] {
    return this.events;
  }
}

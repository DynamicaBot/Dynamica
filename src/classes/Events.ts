import Client from '@/services/Client';
import { ClientEvents } from 'discord.js';
import { Service } from 'typedi';
import type Event from './Event';
import MQTT from './MQTT';

@Service()
export default class Events {
  constructor(private mqtt: MQTT, private client: Client) {}

  private events: Event<keyof ClientEvents>[] = [];

  public register(event: Event<keyof ClientEvents>): void {
    this.events.push(event);
    if (this.mqtt) {
      this.mqtt.publish('dynamica/events', this.events.length.toString());
    }
  }

  public registerListeners(): void {
    this.events.forEach((event) =>
      this.client[event.once ? 'once' : 'on'](event.event, event.response)
    );
  }

  get all(): Event<keyof ClientEvents>[] {
    return this.events;
  }
}

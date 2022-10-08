import { Client, ClientEvents } from 'discord.js';
import type Event from './Event';

export default class Events {
  public static events: Event<keyof ClientEvents>[] = [];

  public static register(event: Event<keyof ClientEvents>): void {
    this.events.push(event);
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

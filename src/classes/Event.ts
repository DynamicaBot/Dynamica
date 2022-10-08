import signaleLogger from '@utils/logger';
import { Client, ClientEvents } from 'discord.js';
import { Signale } from 'signale';

type Awaitable<T> = Promise<T> | T;

export class Event<K extends keyof ClientEvents> {
  public logger: Signale;
  constructor(public event: K, public once: boolean = false) {
    this.logger = signaleLogger.scope('Event', event);
  }

  public response: (...args: ClientEvents[K]) => Awaitable<void>;
}

export class Events {
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

import signaleLogger from '@utils/logger';
import { ClientEvents } from 'discord.js';
import { Signale } from 'signale';

type Awaitable<T> = Promise<T> | T;

export default class Event<K extends keyof ClientEvents> {
  public logger: Signale;

  constructor(public event: K, public once: boolean = false) {
    this.logger = signaleLogger.scope('Event', event);
  }

  public response: (...args: ClientEvents[K]) => Awaitable<void>;
}

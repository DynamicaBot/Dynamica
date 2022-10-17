import { ClientEvents } from 'discord.js';
import { Token } from 'typedi';

type Awaitable<T> = Promise<T> | T;

export default abstract class Event<K extends keyof ClientEvents> {
  abstract event: K;

  abstract once: boolean;

  abstract response: (...args: ClientEvents[K]) => Awaitable<void>;
}

export const EventToken = new Token<Event<keyof ClientEvents>>('events');

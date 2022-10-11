import { ClientEvents } from 'discord.js';
import { Token } from 'typedi';

type Awaitable<T> = Promise<T> | T;

export default interface Event<K extends keyof ClientEvents> {
  event: K;

  once: boolean;

  response: (...args: ClientEvents[K]) => Awaitable<void>;
}

export const EventToken = new Token<Event<keyof ClientEvents>>('events');

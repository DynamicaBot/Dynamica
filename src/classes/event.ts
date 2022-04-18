import { ClientEvents } from 'discord.js';

export default class Event<K extends keyof ClientEvents> {
  public once: boolean;

  public event: K;

  public execute: (...args) => Promise<void>;

  setOnce(once) {
    this.once = once;
    return this;
  }

  setEvent(event: K) {
    this.event = event;
    return this;
  }

  setResponse(response: (...args: ClientEvents[K]) => Promise<void>) {
    this.execute = response;
    return this;
  }
}

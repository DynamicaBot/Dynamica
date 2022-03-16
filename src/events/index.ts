import { ClientEvents } from "discord.js";
export { autocomplete } from "./autocomplete";
export { channelDelete } from "./channelDelete";
export { command } from "./command";
export { guildCreate } from "./guildCreate";
export { guildDelete } from "./guildDelete";
export { presenceUpdate } from "./presenceUpdate";
export { ready } from "./ready";
export { voiceStateUpdate } from "./voiceStateUpdate";

export class Event {
  public once: boolean;
  public event: keyof ClientEvents;
  public execute: (...args: any) => Promise<void>;

  constructor() {}

  setOnce(once) {
    this.once = once;
    return this;
  }

  setEvent(event: keyof ClientEvents) {
    this.event = event;
    return this;
  }

  setResponse(response: (...args: any) => Promise<void>) {
    this.execute = response;
    return this;
  }
}

import { ClientEvents } from "discord.js";

export { channelDelete } from "./channelDelete";
export { guildCreate } from "./guildCreate";
export { guildDelete } from "./guildDelete";
export { presenceUpdate } from "./presenceUpdate";
export { ready } from "./ready";
export { voiceStateUpdate } from "./voiceStateUpdate";

export interface Event {
  name: keyof ClientEvents;
  once: boolean;
  execute: (...args: any) => Promise<any>;
}

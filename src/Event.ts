import { ClientEvents } from "discord.js";

export interface Event {
  once: boolean;
  event: keyof ClientEvents;
  execute: (...args: any) => Promise<void>;
}

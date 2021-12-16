import { ClientEvents } from "discord.js";

interface event {
  name: keyof ClientEvents;
  once: boolean;
  execute: (...args: any) => Promise<any>;
}

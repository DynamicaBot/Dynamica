export { checkCreator } from "./creator";
export { checkGuild } from "./guild";
export { checkManager } from "./manager";
export { checkSecondary } from "./secondary";

import { CommandInteraction } from "discord.js";

export type Check = (interaction: CommandInteraction) => CheckResponse;

type CheckResponse = Promise<{
  success: boolean;
  message?: string;
}>;

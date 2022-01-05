export { checkCreator } from "./creator.js";
export { checkGuild } from "./guild.js";
export { checkManager } from "./manager.js";
export { checkSecondary } from "./secondary.js";

import { CommandInteraction } from "discord.js";

export type Check = (interaction: CommandInteraction) => Promise<boolean>;

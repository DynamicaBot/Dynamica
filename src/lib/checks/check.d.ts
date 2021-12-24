import { CommandInteraction } from "discord.js";

type Check = (interaction: CommandInteraction) => Promise<boolean>;

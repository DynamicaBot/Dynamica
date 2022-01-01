import { CommandInteraction } from "discord.js";
import { Check } from "./check";

/**
 * Check to see if a guild exists in the database. If it doesn't, create it.
 * @param interaction Interaction
 * @returns Promise Boolean
 */
export const checkGuild: Check = async (interaction: CommandInteraction) =>
  !!interaction.guild;

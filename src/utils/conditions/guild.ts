import { CommandInteraction } from "discord.js";
import { Check } from ".";

/**
 * Check to see if a guild exists in the database. If it doesn't, create it.
 * @param interaction Interaction
 * @returns Promise Boolean
 */
export const checkGuild: Check = async (interaction: CommandInteraction) =>
  !!interaction.guild
    ? { success: true }
    : {
        success: false,
        message: "You must be in a guild to use this command.",
      };

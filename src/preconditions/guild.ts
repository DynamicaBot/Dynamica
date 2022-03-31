import { CommandInteraction } from 'discord.js';

/**
 * Check to see if a guild exists in the database. If it doesn't, create it.
 * @param interaction Interaction
 * @returns Promise Boolean
 */
export default async (interaction: CommandInteraction) =>
  interaction.guild
    ? { success: true }
    : {
        success: false,
        message: 'You must be in a guild to use this command.',
      };

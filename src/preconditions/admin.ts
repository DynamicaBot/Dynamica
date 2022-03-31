/**
 * In order for the bot to manage permission-related commands it needs administrator access (private channels)
 * @param interaction Discord interaction
 * @returns success status
 */
export default async (interaction) => {
  if (!interaction.guild.me.permissions.has('ADMINISTRATOR')) {
    return {
      success: false,
      message:
        'The bot requires admin permissions for this to work (private channels).',
    };
  }
  return { success: true };
};

import Condition from '@/classes/condition';

export default new Condition(async (interaction) => {
  if (!interaction.guild.me.permissions.has('ADMINISTRATOR')) {
    return {
      success: false,
      message:
        'The bot requires admin permissions for this to work (private channels).',
    };
  }
  return { success: true };
});

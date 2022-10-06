import Condition from '@/classes/Condition';

export default new Condition(async (interaction) => {
  if (!interaction.appPermissions.has('Administrator')) {
    return {
      success: false,
      message:
        'The bot requires admin permissions for this to work (private channels).',
    };
  }
  return { success: true };
});

import Condition from '@/classes/condition';

export default new Condition(async (interaction) =>
  interaction.guild
    ? { success: true }
    : {
        success: false,
        message: 'You must be in a guild to use this command.',
      }
);

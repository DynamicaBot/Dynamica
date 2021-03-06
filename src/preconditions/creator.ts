import Condition from '@/classes/condition';
import db from '@db';
import logger from '@utils/logger';

export default new Condition(async (interaction) => {
  try {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const id = guildMember.voice.channelId;
    if (!id) {
      return {
        success: false,
        message: 'You need to be in a voice channel to use this command.',
      };
    }
    const channelProperties = await db.secondary.findUnique({
      where: { id },
    });

    if (!channelProperties) {
      return {
        success: false,
        message:
          'You must be in a voice channel managed by the bot to use this command.',
      };
    }

    const dynamicaManager = guildMember?.roles.cache.some(
      (role) => role.name === 'Dynamica Manager'
    );

    const admin = guildMember.permissions.has('ADMINISTRATOR');

    const creator = guildMember.id === channelProperties?.creator;

    if (!creator && !dynamicaManager && !admin) {
      return {
        success: false,
        message: `You must be the creator of <#${id}> to use this command.`,
      };
    }
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false, message: 'An error occured.' };
  }
});

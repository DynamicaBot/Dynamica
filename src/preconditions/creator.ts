import Condition from '@/classes/Condition';
import db from '@db';
import logger from '@utils/logger';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export default new Condition(
  async (interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
      const guildMember = await interaction.guild.members.cache.get(
        interaction.user.id
      );

      const channel = guildMember.voice.channel;
      if (!channel) {
        return {
          success: false,
          message: 'You need to be in a voice channel to use this command.',
        };
      }
      const channelProperties = await db.secondary.findUnique({
        where: { id: channel.id },
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

      const admin = guildMember.permissions.has('Administrator');

      const creator = guildMember.id === channelProperties?.creator;

      if (!creator && !dynamicaManager && !admin) {
        return {
          success: false,
          message: `You must be the creator of ${channel.toString()} to use this command.`,
        };
      }
      return { success: true };
    } catch (error) {
      logger.error(error);
      return { success: false, message: 'An error occured.' };
    }
  }
);

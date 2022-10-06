import Condition from '@/classes/Condition';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export default new Condition(
  async (interaction: ChatInputCommandInteraction<CacheType>) =>
    interaction.guild
      ? { success: true }
      : {
          success: false,
          message: 'You must be in a guild to use this command.',
        }
);

import Condition from '@/classes/Condition';
import { ConditionError } from '@/classes/ConditionError';
import DynamicaSecondary from '@/classes/Secondary';
import logger from '@utils/logger';
import { GuildMember } from 'discord.js';

export const creatorCheck = new Condition(async (interaction) => {
  try {
    if (!(interaction.member instanceof GuildMember))
      throw new ConditionError("You're not in a guild.");
    const channel = interaction.member.voice;

    if (!channel)
      throw new ConditionError(
        'You need to be in a voice channel to use this command.'
      );

    const secondary = DynamicaSecondary.get(channel.channelId);

    if (!secondary)
      throw new ConditionError(
        'You must be in a voice channel managed by the bot to use this command.'
      );

    const secondaryPrisma = await secondary.prisma();
    if (secondaryPrisma.creator !== interaction.user.id)
      throw new ConditionError(
        'You must be the owner of the channel to use this command.'
      );
  } catch (error) {
    logger.error(error);
    throw new ConditionError('An unknown error occured.');
  }
});

import Condition from '@/classes/Condition';
import ConditionError from '@/classes/ConditionError';
import Secondaries from '@/classes/Secondaries';
import { GuildMember } from 'discord.js';
import { Container } from 'typedi';

const creatorCheck = new Condition(async (interaction) => {
  const secondaries = Container.get(Secondaries);
  try {
    if (!(interaction.member instanceof GuildMember))
      throw new ConditionError("You're not in a guild.");
    const channel = interaction.member.voice?.channel;

    if (!channel)
      throw new ConditionError(
        'You need to be in a voice channel to use this command.'
      );

    const secondary = secondaries.get(channel.id);

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
    if (error instanceof ConditionError) {
      throw error;
    } else {
      throw new ConditionError('An unknown error occured.');
    }
  }
});

export default creatorCheck;

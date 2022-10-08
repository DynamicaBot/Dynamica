import Condition from '@/classes/Condition';
import { ConditionError } from '@/classes/ConditionError';
import DynamicaSecondary from '@/classes/Secondary';
import { GuildMember } from 'discord.js';

export const secondaryCheck = new Condition(async (interaction) => {
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
});

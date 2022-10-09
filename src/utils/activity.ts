import { ActivityType, VoiceBasedChannel } from 'discord.js';

const channelActivities = (channel: VoiceBasedChannel) =>
  channel?.members
    .filter((member) => !member.user.bot)
    .filter((member) => !!member.presence)
    .map((member) => member.presence.activities)
    .flat()
    .filter((activity) => activity.type !== ActivityType.Custom)
    .filter((activity) => activity.type !== ActivityType.Listening)
    .map((activity) => activity.name) ?? [];

export default channelActivities;

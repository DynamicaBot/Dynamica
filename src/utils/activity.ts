import { ActivityType, VoiceBasedChannel } from 'discord.js';

const channelActivities = ({ members }: VoiceBasedChannel) =>
  members
    .filter((member) => member.presence.activities.length > 0)
    .filter((member) => !member.user.bot)
    .map((member) => member.presence.activities)
    .flat()
    .filter((activity) => activity.type !== ActivityType.Custom)
    .filter((activity) => activity.type !== ActivityType.Listening)
    .map((activity) => activity.name);

export default channelActivities;

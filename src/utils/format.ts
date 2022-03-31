import { Alias } from '@prisma/client';
import lodash from 'lodash';
import { romanize } from 'romans';

const { uniq } = lodash;

/**
 * Format a string according to template values.
 * @param str The template string to format
 * @param options The different variables that can be provided.
 * @returns The formatted string
 */
export default function formatChannelName(
  /**
   * The template string to format.
   */
  str: string,
  options: {
    /**
     * Creator display name
     */
    creator: string;
    /**
     * Channel number
     */
    channelNumber: number;
    /**
     * List of the duplicated activities from the channel.
     */
    activities: string[];
    /**
     * The available aliases for the guild.
     */
    aliases: Alias[];
    /**
     * The number of members in the channel.
     */
    memberCount: number;
    /**
     * If a channel is locked or not.
     */
    locked: boolean;
  }
) {
  const { creator, channelNumber, activities, aliases, memberCount, locked } =
    options;

  const activityList = uniq(activities);

  const aliasedActivities = activityList.map((activity) => {
    const alias = aliases.find((a) => a.activity === activity);
    if (alias) {
      return alias.alias;
    }
    return activity;
  });

  const plurals = str.split(/<<(.+)\/(.+)>>/g);

  const nato = [
    'Alpha',
    'Bravo',
    'Charlie',
    'Delta',
    'Echo',
    'Foxtrot',
    'Golf',
    'Hotel',
    'India',
    'Juliett',
    'Kilo',
    'Lima',
    'Mike',
    'November',
    'Oscar',
    'Papa',
    'Quebec',
    'Romeo',
    'Sierra',
    'Tango',
    'Uniform',
    'Victor',
    'Whiskey',
    'X-ray',
    'Yankee',
    'Zulu',
  ];

  return `${locked ? '🔒 ' : ''}${str
    .replace(/###/g, channelNumber.toString().padStart(3, '0')) // 001
    .replace(/##/g, `#${channelNumber}`) // #1
    .replace(/\$#/g, channelNumber.toString()) // 1
    .replace(/\+#/g, romanize(channelNumber)) // I
    .replace(/@@nato@@/g, nato[channelNumber - 1]) // Alpha
    .replace(/@@num@@/g, memberCount.toString()) // number of channel members
    .replace(/@@game@@/g, aliasedActivities.join(', ')) // Activities
    .replace(/@@creator@@/g, creator) // Creator
    .replace(/<<(.+)\/(.+)>>/g, memberCount === 1 ? plurals[1] : plurals[2])}`; // Plurals
}

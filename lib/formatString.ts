import { Alias } from "@prisma/client";
import { romanize } from "romans";

export function formatString(
  str: string,
  options: {
    creator: string;
    channelNumber: number;
    activities: string[];
    aliases: Alias[];
    memberCount: Number;
  }
) {
  // get variables between / and >> or << and / and replace with the value

  const { creator, channelNumber, activities, aliases, memberCount } = options;

  const activityList = [...new Set(activities)]
    .filter((activity) => activity !== "Customer Status")
    .map(
      (activity) =>
        aliases.find((alias) => alias.activity === activity)?.alias || activity
    );

  const plurals = str.split(/<<(.+)\/(.+)>>/g);

  return str
    .replace(/###/g, channelNumber.toString().padStart(3, "0")) // 001
    .replace(/##/g, `#${channelNumber}`) // #1
    .replace(/\$#/g, channelNumber.toString()) // 1
    .replace(/\+#/g, romanize(channelNumber)) // I
    .replace(/@@nato@@/g, nato[channelNumber - 1]) // Alpha
    .replace(/@@num@@/g, memberCount.toString()) // number of channel members
    .replace(/@@creator@@/g, creator) // Creator
    .replace(/@@game@@/g, activityList.join(", ")) // Activities
    .replace(/<<(.+)\/(.+)>>/g, memberCount === 1 ? plurals[1] : plurals[2]); // person
}

const nato = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliett",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
  "Quebec",
  "Romeo",
  "Sierra",
  "Tango",
  "Uniform",
  "Victor",
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
];

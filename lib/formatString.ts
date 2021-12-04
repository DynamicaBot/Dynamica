import { Alias } from "@prisma/client";

export function formatString({
  str,
  channelNumber,
  creator,
  activities,
  aliases,
}: {
  /**
   * The string to format
   */
  str: string;
  /**
   * The channel number
   */
  channelNumber: number;
  /**
   * The creator of the channel
   */
  creator: string;

  /**
   * Game name aliases
   */
  aliases: Alias[];

  /**
   * The current activities
   */
  activities?: string[];
}) {
  const precision = channelNumber.toPrecision(2);

  let formattedString = str;

  formattedString = formattedString
    .replace("\n", " ") // No new lines
    .replace("###", precision) // Numbers
    .replace("##", `#${channelNumber}`)
    .replace("@@nato@@", nato[channelNumber - 1]) // Alpha
    .replace("@@creator@@", creator); // Creator
  if (activities) {
    formattedString = formattedString.replace(
      "@@game@@",
      activities
        .map(
          (activity) =>
            aliases.find((alias) => alias.activity === activity)?.alias ||
            activity
        )
        .toString()
    );
  }

  return formattedString;
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

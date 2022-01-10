import { Alias, Guild, Primary, Secondary } from "@prisma/client";
import pDebounce from "p-debounce";
import pThrottle from "p-throttle";
import path from "path/posix";
import { client } from ".";
import { bree } from "./utils/bree";
import { db } from "./utils/db";
import { formatChannelName } from "./utils/formatString";
import { getChannel } from "./utils/getCached";
import { logger } from "./utils/logger";

export async function registerNewJob(secondary: Secondary) {
  const { id, guildId } = secondary;
  bree.add({
    name: id,
    worker: {
      workerData: {
        id,
        guildId,
      },
    },
    path: path.join(__dirname, "jobs", "refreshSecondary.js"),
  });
}

export async function registerJobs() {
  db.secondary.findMany().then((secondaries) => {
    bree.add(
      secondaries.map((secondary) => ({
        name: secondary.id,
        worker: {
          workerData: {
            id: secondary.id,
            guildId: secondary.guildId,
          },
        },
        path: path.join(__dirname, "jobs", "refreshSecondary.js"),
      }))
    );
    logger.info("Registered Secondaries");
  });
}

async function editChannel({
  aliases,
  secondary,
  id,
}: {
  aliases?: Alias[];
  secondary?: Secondary & {
    primary: Primary;
    guild: Guild;
  };
  id?: string;
}) {
  /**
   * The discord channel to be refreshed
   */
  const channel = await getChannel(client.channels, id);

  if (!channel) {
    console.debug("No channel");
    process.exit(1);
  }
  if (!channel.isVoice()) return;

  /**
   * The name of the creator based on the config
   */
  const channelCreator = secondary.creator
    ? channel.members.get(secondary.creator)?.displayName
    : undefined;

  /**
   * The creator or, alternatively the person who will become the creator.
   */
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;

  /**
   * Get the activities of all the members of the channel.
   */
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });

  /**
   * The activities list minus stuff that should be ignored like Spotify and Custom status // Todo: more complicated logic for people who might be streaming
   */
  const filteredActivityList = activities
    .filter((activity) => activity !== "Spotify")
    .filter((activity) => activity !== "Custom Status");
  const { locked } = secondary;

  /**
   * The template to be used.
   */
  const str = secondary.name
    ? secondary.name
    : !filteredActivityList.length
    ? secondary.primary.generalName
    : secondary.primary.template;

  /**
   * The formatted name
   */
  const name = formatChannelName(str, {
    creator: creator ? creator : "",
    aliases: aliases,
    channelNumber: 1,
    activities: filteredActivityList,
    memberCount: channel.members.size, // Get this
    locked,
  });

  if (channel.name === name) return;
  if (!channel.manageable) {
    await logger.debug(`Failed to edit channel ${channel.id}.`);
    return;
  }
  await channel.edit({
    name,
  });

  await logger.debug(
    `Secondary channel ${channel.name} in ${channel.guild.name} name changed.`
  );
}

const renameThrottle = pThrottle({
  limit: 2,
  interval: 600000,
});

const throttledRename = renameThrottle(editChannel);
const renameDebounce = pDebounce(throttledRename, 5000);

export function startJobs() {
  logger.info("Started Jobs");
  bree.on("worker created", (name) => {
    bree.workers[name]?.on("message", renameDebounce);
  });
}

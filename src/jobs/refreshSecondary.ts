import { workerData } from "worker_threads";
import { formatChannelName } from "../lib/formatString.js";
import { getChannel } from "../lib/getCached.js";
import { logger } from "../lib/logger.js";
import { db } from "../lib/prisma.js";
import { renameThrottle } from "../lib/scheduler.js";

renameThrottle(async () => {
  // const channel: AnyChannel = workerData.channel;
  // console.log({ channels: client.channels, id: workerData.channel.id });
  console.log("test", workerData.channelManager, workerData.channel.id);
  const channel = await getChannel(
    workerData.channelManager,
    workerData.channel.id
  );

  if (!channel.isVoice()) return;
  const { id } = channel;
  const secondary = await db.secondary.findUnique({
    where: { id },
    include: {
      primary: true,
      guild: true,
    },
  });
  const aliases = await db.alias.findMany({
    where: {
      guildId: channel.guildId,
    },
  });
  if (!secondary) return;

  const { locked } = secondary;

  const channelCreator = secondary.creator
    ? channel.members.get(secondary.creator)?.displayName
    : "";
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;
  if (!channel?.manageable) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const filteredActivityList = activities
    .filter((activity) => activity !== "Spotify")
    .filter((activity) => activity !== "Custom Status");
  const str = secondary.name
    ? secondary.name
    : !filteredActivityList.length
    ? secondary.primary.generalName
    : secondary.primary.template;
  logger.log({ locked });
  const name = formatChannelName(str, {
    creator: creator ? creator : "",
    aliases: aliases,
    channelNumber: 1,
    activities: filteredActivityList,
    memberCount: channel.members.size,
    locked,
  });
  if (channel.name !== name) {
    await channel.edit({
      name,
    });
    await logger.debug(
      `Secondary channel ${channel.name} in ${channel.guild.name} refreshed.`
    );
  }
})();

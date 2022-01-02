import { Client, Intents } from "discord.js";
import { workerData } from "worker_threads";
import { formatChannelName } from "../lib/formatString.js";
import { getChannel } from "../lib/getCached.js";
import { logger } from "../lib/logger.js";
import { db } from "../lib/prisma.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

client.login(process.env.TOKEN).then(async () => {
  const channel = await getChannel(client.channels, workerData.channel.id);

  if (!channel) {
    console.debug("No channel");
    process.exit(1);
  }
  if (!channel.isVoice()) process.exit(1);

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
  if (!secondary) process.exit(1);

  const { locked } = secondary;

  const channelCreator = secondary.creator
    ? channel.members.get(secondary.creator)?.displayName
    : "";
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;
  if (!channel?.manageable) process.exit(1);
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
      `Secondary channel ${channel.name} in ${channel.guild.name} name changed.`
    );
  }
});

// TODO: At the moment you need to login every time a channel name needs to be changed. This can get ratelimited. Maybe send a message back to the client with channel if etc.

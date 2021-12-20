import { Manager } from "discord-hybrid-sharding";
import { config } from "dotenv";
import { logger } from "./lib/logger";
config();
const client = new Manager("dist/bot.js", {
  totalShards: 2,
  totalClusters: 1,
  mode: "process",
  usev13: true,
  token: process.env.TOKEN,
});

client.on("clusterCreate", (cluster) =>
  logger.info(`Cluster ${cluster.id} Has Been Launched, Now Starting Bot`)
);
client.spawn(undefined, undefined, -1);

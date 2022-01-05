import "reflect-metadata";
import { parentPort, workerData } from "worker_threads";
import { db } from "../lib/prisma";

// TODO: At the moment it isn't possible to share the djs socket with the parent process Vladdy#0002 has said this feature is in the planning stage as of 3/1/2022
// Lioness100 has a solution https://github.com/Naval-Base/yuudachi/blob/main/src/jobs.ts
export default async function refreshSecondary() {
  const { id, guildId } = workerData;
  /**
   * Return secondary
   */
  const secondary = await db.secondary.findUnique({
    where: { id },
    include: {
      primary: true,
      guild: true,
    },
  });

  /**
   * Return aliases
   */
  const aliases = await db.alias.findMany({
    where: {
      guildId: guildId,
    },
  });
  if (!secondary) process.exit(1);

  parentPort.postMessage({
    aliases,
    secondary,
    id,
  });
}

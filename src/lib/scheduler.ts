import Bree from "bree";
import pThrottle from "p-throttle";
import { logger } from "./logger.js";

// 👇️ "/home/john/Desktop/javascript"
export const bree = new Bree({
  root: false,
  logger: false,
  errorHandler: (error, workerMetadata) => {
    if (workerMetadata.threadId) {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    logger.error(error);
  },
});

export const renameThrottle = pThrottle({
  limit: 2,
  interval: 600000,
});

bree.on("worker created", (name) => {
  logger.debug("worker created", name);
});

bree.on("worker deleted", (name) => {
  logger.debug("worker deleted", name);
});

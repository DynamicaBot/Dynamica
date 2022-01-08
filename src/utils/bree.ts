import Bree from "bree";
import { logger } from "./logger";

/**
 * Bree instance
 */
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

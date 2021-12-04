import { prisma } from "../lib/prisma";
import { Client } from "discord.js";
import { info, log } from "../lib/colourfulLogger";
import { scheduler } from "../lib/scheduler";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { refreshSecondary } from "../lib/operations";

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    info(`Ready! Logged in as ${client.user?.tag}`);
  },
};

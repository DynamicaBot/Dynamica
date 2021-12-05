import { prisma } from "../lib/prisma";
import { Client, Guild } from "discord.js";
import { debug } from "../lib/colourfulLogger";

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild: Guild) {
    await guild.roles.create({
      name: "Dynamica Manager",
    });
    debug(`Joined guild ${guild.id} named: ${guild.name}`);
  },
};

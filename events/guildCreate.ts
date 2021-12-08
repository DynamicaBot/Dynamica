import { prisma } from "../lib/prisma";
import { Client, Guild } from "discord.js";
import { debug } from "../lib/colourfulLogger";
import checkGuild from "../lib/checks/guild";

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild: Guild) {
    if (!guild.roles.fetch("Dynamica Manager")) {
      await guild.roles.create({
        name: "Dynamica Manager",
      });
    }
    checkGuild(guild.id);
    debug(`Joined guild ${guild.id} named: ${guild.name}`);
  },
};

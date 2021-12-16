import checkGuild from "@lib/checks/guild";
import { debug } from "@lib/colourfulLogger";
import { Guild } from "discord.js";
import { event } from "./event";

export const guildCreate: event = {
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

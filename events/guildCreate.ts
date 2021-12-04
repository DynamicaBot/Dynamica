import { Client, Guild } from "discord.js";
import { debug } from "../lib/colourfulLogger";

module.exports = {
  name: "guildCreate",
  once: false,
  execute(guild: Guild) {
    debug(`Joined guild ${guild.id} named: ${guild.name}`);
  },
};

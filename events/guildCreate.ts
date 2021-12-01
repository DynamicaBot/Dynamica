import { Client, Guild } from "discord.js";
import { channels, guilds } from "../lib/keyv";

module.exports = {
  name: "guildCreate",
  once: false,
  execute(guild: Guild) {
    console.log(guild.id);
    // if (!guilds.get(guild.id)) {
    //   guilds.set(guild.id, {
    //     owner: guild.ownerId,
    //   });
    // }
  },
};

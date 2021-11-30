import { Client, Guild } from "discord.js";
import { db } from "../lib/keyv";

module.exports = {
  name: "guildCreate",
  once: false,
  execute(guild: Guild) {
    console.log(guild.id);
    db.set(guild.id, {
      channels: [],
      aliases: {},
    });
  },
};

//  {
//     channels: [],
//     aliases: {
//       vscode: "Coding Thingo",
//     },
//   }

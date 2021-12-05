import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  console.log("Missing env vars.");
} else {
  const commands = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file: string) => file.endsWith(".ts"));

  // Place your client and guild ids here

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(TOKEN);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: commands,
        });
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands,
        });
      }

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
}

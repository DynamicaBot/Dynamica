import { config } from "dotenv";
config();
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
  console.log("Missing env vars.");
} else {
  const rest = new REST({ version: "9" }).setToken(TOKEN);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: [],
        });
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: [],
        });
      }

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
}

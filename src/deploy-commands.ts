require("dotenv").config();
import { config } from "dotenv";
config();
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as commands from "./commands";

const remove = process.argv.at(2);

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (remove === "remove") {
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
} else if (remove === "deploy") {
  if (!TOKEN || !CLIENT_ID) {
    console.log("Missing env vars.");
  } else {
    const commandList = Object.values(commands).map((command) =>
      command.data.toJSON()
    );

    const rest = new REST({ version: "9" }).setToken(TOKEN);

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");
        if (GUILD_ID) {
          await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commandList,
          });
        } else {
          await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commandList,
          });
        }

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();
  }
} else {
  console.log("Specify an action either deploy or remove.");
}

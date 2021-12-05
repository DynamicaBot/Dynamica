import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  console.log("Missing env vars.");
} else {
  const commands: any[] = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file: string) => file.endsWith(".ts" || ".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(TOKEN);
  if (GUILD_ID) {
    rest
      .get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID))
      .then((data: any) => {
        const promises = [];
        for (const command of data) {
          console.log(`Deleted guild command: ${command.name}`);
          const deleteUrl: any = `${Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
          )}/${command.id}`;
          promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
      })
      .then((data) => {
        console.log("deleted old guild application command");
        rest
          .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
          })
          .then(() =>
            console.log("Successfully registered application commands.")
          )
          .catch(console.error);
      })
      .catch(console.error);
  } else {
    rest
      .get(Routes.applicationCommands(CLIENT_ID))
      .then((data: any) => {
        const promises = [];
        for (const command of data) {
          console.log(`Deleted ${command.name}`);
          const deleteUrl: any = `${Routes.applicationCommands(CLIENT_ID)}/${
            command.id
          }`;
          promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
      })
      .then((data: any) => {
        rest
          .put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
          })
          .then(() =>
            console.log("Successfully registered application commands.")
          )
          .catch(console.error);
      });
  }
}

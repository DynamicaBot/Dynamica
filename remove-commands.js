require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  console.log("Missing env vars.");
} else {
  const commands = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".ts"));

  // Place your client and guild ids here

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(TOKEN);

  (async () => {
    try {
      console.log("Started deletion of application (/) commands.");
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: [],
        });
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: [],
        });
      }

      console.log("Successfully deleted application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
}

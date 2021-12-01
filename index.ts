require("dotenv").config();
import { Intents, Collection, Client } from "discord.js";
import fs from "fs";

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const commands = new Collection<
  string,
  {
    data: object;
    execute: any;
  }
>();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file: string) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  // console.log({ command });
  commands.set(command.data.name, command);
}

const eventFiles = fs
  .readdirSync("./events")
  .filter((file: string) => file.endsWith(".ts"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});
// Login to Discord with your client's token
client.login(process.env.TOKEN);

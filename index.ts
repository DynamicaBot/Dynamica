require("dotenv").config();
import { Intents, Collection, Client } from "discord.js";
import fs from "fs";

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    // await interaction.deferReply();
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

const menus = new Collection<
  string,
  {
    customId: string;
    execute: any;
  }
>();

const menuFiles = fs
  .readdirSync("./menus")
  .filter((file: string) => file.endsWith(".ts"));

for (const file of menuFiles) {
  const menu = require(`./menus/${file}`);
  menus.set(menu.customId, menu);
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
  if (!interaction.isSelectMenu()) return;

  const menu = menus.get(interaction.customId);

  if (!menu) return;

  try {
    await menu.execute(interaction);
  } catch (error) {
    console.error(error);
    // await interaction.deferReply();
    // await interaction.reply({
    //   content: "There was an error while executing this command!",
    //   ephemeral: true,
    // });
  }
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);

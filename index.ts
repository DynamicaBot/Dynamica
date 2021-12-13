import dotenv from "dotenv";
dotenv.config();
import { Intents, Collection, Client } from "discord.js";
import fs from "fs";
import { ErrorEmbed } from "./lib/discordEmbeds";
import { error, info } from "./lib/colourfulLogger";
import { scheduler } from "./lib/scheduler";

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
  } catch (e) {
    error(e);
    // await interaction.deferReply();
    interaction.reply({
      embeds: [ErrorEmbed("There was an error while executing this command!")],
      ephemeral: true,
    });
  }
});

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

// Login to Discord with your client's token
client.login(process.env.TOKEN);

process.on("SIGINT", () => {
  client.destroy()
  scheduler.stop()
  info("Bot Stopped")
})

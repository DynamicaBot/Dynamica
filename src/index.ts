import dotenv from "dotenv";
dotenv.config();
import { Intents, Collection, Client } from "discord.js";
import { ErrorEmbed } from "./lib/discordEmbeds";
import { error, info } from "./lib/colourfulLogger";
import { scheduler } from "./lib/scheduler";
import { prisma } from "./lib/prisma";
import * as commands from "./commands";
import * as events from "./events";

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

const commandList = Object.values(commands);
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commandList.find(
    (command) => command.data.name === interaction.commandName
  );

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (e) {
    error(e);
    interaction.reply({
      embeds: [ErrorEmbed("There was an error while executing this command!")],
      ephemeral: true,
    });
  }
});

const eventList = Object.values(events);

for (const event of eventList) {
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

// Login to Discord with your client's token
client.login(process.env.TOKEN);

process.on("SIGINT", () => {
  client.destroy();
  scheduler.stop();
  prisma.$disconnect();
  info("Bot Stopped");
});

import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import * as commands from "./commands";
import { Command } from "./commands/command";
import * as events from "./events";
import { ErrorEmbed } from "./lib/discordEmbeds";
import { logger } from "./lib/logger";
import { db } from "./lib/prisma";
import { scheduler } from "./lib/scheduler";
dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

const eventList = Object.values(events);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  try {
    const command: Command = commands[interaction.commandName];
    const conditions = await Promise.all(
      command.conditions.map((condition) => condition(interaction))
    );
    if (!conditions.every((condition) => condition)) {
      interaction.reply({
        embeds: [
          ErrorEmbed(
            "You didn't meet one of the conditions to run this command."
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await command.execute(interaction);
  } catch (e) {
    logger.error(e);
    interaction.reply({
      embeds: [ErrorEmbed("There was an error while executing this command!")],
      ephemeral: true,
    });
  }
});

// Register event handlers
for (const event of eventList) {
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

// Login to Discord with your client's token
client.login(process.env.TOKEN);

// Handle stop signal
process.on("SIGINT", () => {
  client.destroy();
  scheduler.stop();
  db.$disconnect();
  logger.info("Bot Stopped");
});

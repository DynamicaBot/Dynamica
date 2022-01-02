import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import { Autocomplete } from "./autocompletes/autocomplete.js";
import * as autocompletes from "./autocompletes/index.js";
import { Command } from "./commands/command.js";
import * as commands from "./commands/index.js";
import * as events from "./events/index.js";
import { checkGuild } from "./lib/checks/index.js";
import { ErrorEmbed } from "./lib/discordEmbeds.js";
import { logger } from "./lib/logger.js";
import { db } from "./lib/prisma.js";
import { bree } from "./lib/scheduler.js";
dotenv.config();

// Create a new client instance
export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

// Login to Discord with your client's token

const eventList = Object.values(events);
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  try {
    const command: Command = commands[interaction.commandName];
    const conditions = await Promise.all(
      command.conditions
        .concat([checkGuild])
        .map((condition) => condition(interaction))
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  try {
    const autocomplete: Autocomplete = autocompletes[interaction.commandName];

    await autocomplete.execute(interaction);
  } catch (e) {
    logger.error(e);
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

client.login(process.env.TOKEN);

// Handle stop signal
process.on("SIGINT", () => {
  client.destroy();
  bree.stop();
  db.$disconnect();
  logger.info("Bot Stopped");
});

import Bree from "bree";
import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import "reflect-metadata";
import signale from "signale";
import { container } from "tsyringe";
import * as autocompletes from "./autocompletes";
import * as commands from "./commands";
import events from "./events";
import { AutocompleteBuilder, CommandBuilder } from "./lib/builders";
import { checkGuild } from "./lib/conditions";
import { ErrorEmbed } from "./lib/discordEmbeds";
import { db } from "./lib/prisma";
import { kBree, kLogger } from "./tokens";
dotenv.config();

const { Signale } = signale;

/**
 * Signale Logger instance
 */
const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
  secrets: [process.env.TOKEN, process.env.CLIENT_ID],
});

/**
 * DiscordJS Client instance
 */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

/**
 * Bree instance
 */
const bree = new Bree({
  root: false,
  logger: false,
  errorHandler: (error, workerMetadata) => {
    if (workerMetadata.threadId) {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      logger.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    logger.error(error);
  },
});

container.register(kLogger, { useValue: logger });
container.register(Client, { useValue: client });
container.register(kBree, { useValue: bree });

const eventList = Object.values(events);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  try {
    const command: CommandBuilder = commands[interaction.commandName];
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
    } else {
      await command.run(interaction);
    }
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
    const autocomplete: AutocompleteBuilder =
      autocompletes[interaction.commandName];
    autocomplete.run(interaction);
  } catch (e) {
    logger.error(e);
  }
});

// Register event handlers
for (const event of eventList) {
  if (event.once) {
    client.once(event.name, (...args: any) => event.run(...args));
  } else {
    client.on(event.name, (...args: any) => event.run(...args));
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

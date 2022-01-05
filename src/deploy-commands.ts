import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import "reflect-metadata";
import signale from "signale";
import * as commands from "./commands";
import { CommandBuilder } from "./lib/builders";
const { Signale } = signale;
config();

const logger = new Signale({
  disabled: false,
  interactive: false,
  logLevel: process.env.LOG_LEVEL || "info",
  secrets: [process.env.TOKEN, process.env.CLIENT_ID],
});

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
  logger.error("Missing env vars.");
} else {
  const commandList = Object.values(commands).map((command: CommandBuilder) =>
    command.data.toJSON()
  );

  const rest = new REST({ version: "9" }).setToken(TOKEN);

  (async () => {
    try {
      await logger.info("Started refreshing application (/) commands.");
      if (GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: commandList,
        });
        await logger.debug(
          "Updated commands: ",
          commandList.map((c) => c.name).join(", ")
        );
      } else {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commandList,
        });
        await logger.debug(
          "Updated commands: ",
          commandList.map((c) => c.name).join(", ")
        );
      }

      await logger.info("Successfully reloaded application (/) commands.");
    } catch (error) {
      await logger.error(error);
    }
  })();
}

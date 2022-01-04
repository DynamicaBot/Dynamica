import { CommandInteraction } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import * as commands from "../commands/index.js";
import { ErrorEmbed } from "../lib/discordEmbeds.js";
import { kLogger } from "../tokens.js";
import { event } from "./event.js";

export const commandListener: event = {
  name: "interactionCreate",
  once: false,
  async execute(interaction: CommandInteraction) {
    const logger = container.resolve<Signale>(kLogger);
    if (!interaction.isCommand()) return;
    try {
      await commands[interaction.commandName].execute(interaction);
    } catch (e) {
      logger.error(e);
      interaction.reply({
        embeds: [
          ErrorEmbed("There was an error while executing this command!"),
        ],
        ephemeral: true,
      });
    }
  },
};

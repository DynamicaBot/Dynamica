import { CacheType, Interaction } from "discord.js";
import { Command } from "../Command";
import * as commands from "../commands";
import { Event } from "../Event";
import { checkGuild } from "../utils/conditions";
import { ErrorEmbed } from "../utils/discordEmbeds";
import { logger } from "../utils/logger";

export const command: Event = {
  event: "interactionCreate",
  once: false,
  async execute(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    try {
      const command: Command = commands[interaction.commandName];
      const { conditions } = command;
      const conditionResults = await Promise.all(
        [checkGuild, ...conditions].map((condition) => condition(interaction))
      );

      const failingCondition = conditionResults.find(
        (condition) => !condition.success
      );

      if (failingCondition) {
        interaction.reply({
          ephemeral: true,
          embeds: [ErrorEmbed(failingCondition.message)],
        });
      } else {
        command.execute(interaction);
      }
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

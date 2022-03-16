import { CacheType, Interaction } from "discord.js";
import { Event } from ".";
import * as commands from "../commands";
import { checkGuild } from "../utils/conditions";
import { ErrorEmbed } from "../utils/discordEmbeds";
import { logger } from "../utils/logger";

export const command = new Event()
  .setOnce(false)
  .setEvent("interactionCreate")
  .setResponse(async (interaction: Interaction<CacheType>) => {
    if (!interaction.isCommand()) return;
    try {
      const command = commands[interaction.commandName];
      const { preconditions: conditions } = command;
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
  });

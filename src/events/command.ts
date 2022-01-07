import { CacheType, Interaction } from "discord.js";
import * as commands from "../commands";
import { Event } from "../Event";
import { checkGuild } from "../lib/conditions";
import { ErrorEmbed } from "../lib/discordEmbeds";

export const command: Event = {
  event: "interactionCreate",
  once: false,
  async execute(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    try {
      const command = commands[interaction.commandName];

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
        await command.execute(interaction);
      }
    } catch (e) {
      this.logger.error(e);
      interaction.reply({
        embeds: [
          ErrorEmbed("There was an error while executing this command!"),
        ],
        ephemeral: true,
      });
    }
  },
};

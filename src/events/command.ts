import Command from '@classes/command';
import Event from '@classes/event';
import * as commands from '@commands';
import checkGuild from '@preconditions/guild';
import { ErrorEmbed } from '@utils/discordEmbeds';
import logger from '@utils/logger';
import { CacheType, Interaction } from 'discord.js';

export default new Event()
  .setOnce(false)
  .setEvent('interactionCreate')
  .setResponse(async (interaction: Interaction<CacheType>) => {
    if (!interaction.isCommand()) return;
    try {
      // eslint-disable-next-line import/namespace
      const command: Command = commands[interaction.commandName];
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
          ErrorEmbed('There was an error while executing this command!'),
        ],
        ephemeral: true,
      });
    }
  });

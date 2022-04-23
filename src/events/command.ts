import Condition from '@/classes/condition';
import Event from '@classes/event';
import commands from '@commands';
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
      const command = commands[interaction.commandName];
      const { preconditions: conditions } = command;
      const conditionResults = await Promise.all(
        [checkGuild as Condition, ...conditions].map((condition) =>
          condition.check(interaction)
        )
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

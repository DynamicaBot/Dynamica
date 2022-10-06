import Command from '@/classes/command';
import Condition from '@/classes/condition';
import Event from '@classes/event';
import * as commands from '@commands';
import checkGuild from '@preconditions/guild';
import { ErrorEmbed } from '@utils/discordEmbeds';
import logger from '@utils/logger';

export default new Event<'interactionCreate'>()
  .setOnce(false)
  .setEvent('interactionCreate')
  .setResponse(async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      const command: Command = commands[interaction.commandName];
      const { conditions } = command;
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
        command.response(interaction);
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

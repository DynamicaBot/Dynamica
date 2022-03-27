import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { logger } from "../utils/logger.js";
import { editChannel } from "../utils/operations/secondary.js";

export const general = new Command()
  .setPreconditions([checkManager])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("general")
      .setDescription("Edit the name/template for the default general channel.")
      .addStringOption((option) =>
        option
          .setAutocomplete(true)
          .setName("channel")
          .setDescription("The channel to change the template for.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new template for the general channel.")
          .setRequired(true)
      )
  )
  .setHelpText(
    "Using the /general command you can set the template for the channel name of the channel you're in when nobody is playing a game."
  )
  .setResponse(async (interaction) => {
    const name = interaction.options.getString("name", true);
    const channel = interaction.options.getString("channel", true);

    const updatedPrimary = await db.primary.update({
      where: { id: channel },
      data: { generalName: name },
      include: { secondaries: true },
    });

    updatedPrimary.secondaries.forEach((secondary) => {
      try {
        const discordChannel = interaction.guild.channels.cache.get(
          secondary.id
        );
        if (discordChannel.isVoice()) {
          editChannel({ channel: discordChannel });
        }
      } catch (error) {
        logger.error("Failed to update child channels", error);
      }
    });

    await interaction.reply(
      `General template for <#${channel}> changed to \`${name}.\``
    );
  });

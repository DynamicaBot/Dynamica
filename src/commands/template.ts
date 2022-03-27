import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { editChannel } from "../utils/operations/secondary.js";

export const template = new Command()
  .setPreconditions([checkManager])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("template")
      .setDescription("Edit the template for all secondary channels.")
      .addStringOption((option) =>
        option
          .setAutocomplete(true)
          .setName("channel")
          .setDescription("The channel to change the template for.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("template")
          .setDescription("The new template for all secondary channels.")
          .setRequired(true)
      )
  )
  .setHelpText(
    "Using the /template command you can set the template for the channel name target primary channel.",
    "Using the /template command you can set the template for the channel name target primary channel. The default template is @@game@@ ## which will format the name of the channel according to the formatting rules."
  )
  .setResponse(async (interaction) => {
    const name = interaction.options.getString("template", true);
    const channel = interaction.options.getString("channel", true);

    db.primary.update({
      where: { id: channel },
      data: { template: name },
    });
    const discordChannel = interaction.guild.channels.cache.get(channel);
    if (discordChannel.isVoice()) {
      editChannel({ channel: discordChannel });
    }

    return interaction.reply(`Template Changed to ${name}.`);
  });

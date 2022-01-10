import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { db } from "../utils/db";
import { SuccessEmbed } from "../utils/discordEmbeds";

export const template: Command = {
  conditions: [checkManager],
  data: new SlashCommandBuilder()
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
    ),
  helpText: {
    short:
      "Using the /template command you can set the template for the channel name target primary channel.",
    long: "Using the /template command you can set the template for the channel name target primary channel. The default template is @@game@@ ## which will format the name of the channel according to the formatting rules.",
  },
  async execute(interaction) {
    const name = interaction.options.getString("template", true);
    const channel = interaction.options.getString("channel", true);

    db.primary.update({
      where: { id: channel },
      data: { template: name },
    });

    return interaction.reply({
      embeds: [SuccessEmbed(`Template Changed to ${name}.`)],
    });
  },
};

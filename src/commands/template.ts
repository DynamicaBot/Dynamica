import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
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

  async execute(interaction: CommandInteraction): Promise<void> {
    const name = interaction.options.getString("template", true);
    const channel = interaction.options.getString("channel", true);

    if (!interaction.guild) return;
    await db.primary.update({
      where: { id: channel },
      data: { template: name },
    });
    await interaction.reply({
      embeds: [SuccessEmbed(`Template Changed to ${name}.`)],
    });
  },
};

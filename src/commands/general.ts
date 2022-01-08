import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager } from "../utils/conditions";
import { db } from "../utils/db";
import { SuccessEmbed } from "../utils/discordEmbeds";

export const general: Command = {
  conditions: [checkManager],
  data: new SlashCommandBuilder()
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
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    const name = interaction.options.getString("name", true);
    const channel = interaction.options.getString("channel", true);

    await db.primary.update({
      where: { id: channel },
      data: { generalName: name },
    });
    await interaction.reply({
      embeds: [
        SuccessEmbed(`General template for <#${channel}> changed to ${name}.`),
      ],
    });
  },
};

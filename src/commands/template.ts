import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandBuilder } from "../lib/builders";
import { checkManager } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";

export const template = new CommandBuilder()
  .setConditions([checkManager])
  .setData(
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
  .setResponse(async (interaction: CommandInteraction) => {
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
  });

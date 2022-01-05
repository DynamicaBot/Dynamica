import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkManager } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { CommandBuilder } from "./";

export const general = new CommandBuilder()
  .setConditions([checkManager])
  .setData(
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
  .setResponse(async (interaction: CommandInteraction) => {
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
  });

import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { db } from "../lib/prisma";
import { CommandBuilder } from "./";

export const allowjoin = new CommandBuilder()
  .setConditions([checkManager])
  .setData(
    new SlashCommandBuilder()
      .setName("allowjoin")
      .setDescription("Allow users to request to join a locked channel.")
      .addBooleanOption((option) =>
        option
          .setName("state")
          .setDescription("Whether to enable or disable join requests.")
          .setRequired(true)
      )
  )
  .setResponse(async (interaction) => {
    const state = interaction.options.getBoolean("state", true);
    await db.guild.update({
      where: { id: interaction.guild.id },
      data: {
        allowJoinRequests: state,
      },
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(`${!state ? "Disabled" : "Enabled"} Join Requests`),
      ],
    });
  });

import { db } from "@db";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkPermissions } from "@lib/checks/permissions";
import { checkSecondary } from "@lib/checks/validSecondary";
import { ErrorEmbed, SuccessEmbed } from "@lib/discordEmbeds";
import { CommandInteraction } from "discord.js";
import { Command } from "./command";

export const template: Command = {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Edit the template for all secondary channels.")
    .addStringOption((option) =>
      option
        .setName("template")
        .setDescription("The new template for all secondary channels.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) return;
    const cachedUser = interaction.guild?.members.cache.get(
      interaction.user.id
    );
    const user = cachedUser
      ? cachedUser
      : await interaction.guild?.members.fetch(interaction.user.id);
    const secondaryId = user?.voice.channelId;
    if (!secondaryId) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
      });
      return;
    }
    const secondaryConfig = await db.secondary.findUnique({
      where: {
        id: secondaryId,
      },
      include: {
        primary: true,
      },
    });

    if (!(await checkSecondary(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid Dynamica channel.")],
      });
      return;
    }

    if (!secondaryConfig) return;
    const template = interaction.options.getString("template", true);

    if (!(await checkPermissions(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
      });
      return;
    }
    await db.primary.update({
      where: { id: secondaryConfig.primary.id },
      data: { template },
    });
    await interaction.reply({
      embeds: [SuccessEmbed(`Template changed to ${template}`)],
    });
  },
};
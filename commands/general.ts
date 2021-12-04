import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { prisma } from "../lib/prisma";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("general")
    .setDescription("Edit the name/template for the default general channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new template for the general channel.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const user = await interaction.guild?.members.fetch(interaction.user.id);
    const secondaryId = user?.voice.channelId;
    if (!secondaryId) {
      interaction.reply({
        content: "Must be in a Dynamica-controlled voice channel.",
      });
      return;
    }
    const secondaryConfig = await prisma.secondary.findUnique({
      where: {
        id: secondaryId,
      },
      include: {
        primary: true,
      },
    });
    if (!secondaryConfig) {
      interaction.reply({
        content: "Must be in a Dynamica-controlled voice channel.",
      });
      return;
    }
    const name = interaction.options.getString("name", true);
    const cachedGuildMember = await interaction.guild?.members.cache.get(
      interaction.user.id
    );
    const guildMember = cachedGuildMember
      ? cachedGuildMember
      : await interaction.guild?.members.fetch(interaction.user.id);

    if (
      !guildMember?.roles.cache.some((role) => role.name === "Dynamica Manager")
    ) {
      interaction.reply({
        ephemeral: true,
        content: "Must have the Dynamica role to manage aliases.",
      });
      return;
    }
    const channelConfig = await prisma.primary.findUnique({
      where: { id: secondaryConfig.primary.id },
      include: {
        secondaries: true,
      },
    });
    if (!channelConfig) return;
    await prisma.primary.update({
      where: { id: secondaryConfig.primary.id },
      data: { generalName: name },
    });
    await interaction.reply({ content: "Success", ephemeral: true });
  },
};

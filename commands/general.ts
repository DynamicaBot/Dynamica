import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { prisma } from "../lib/prisma";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("general")
    .setDescription("Edit the name/template for the default general channel.")
    .addChannelOption((option) =>
      option
        .setName("primary")
        .setDescription(
          "The primary channel to change the general template for."
        )
        .setRequired(true)
        .addChannelType(2)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new template for the general channel.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const primary = interaction.options.getChannel("primary", true);
    const name = interaction.options.getString("name", true);
    const guildMember = await interaction.guild?.members.cache.get(
      interaction.user.id
    );
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
      where: { id: primary?.id },
      include: {
        secondaries: true,
      },
    });
    if (!channelConfig) return;
    await prisma.primary.update({
      where: { id: primary.id },
      data: { generalName: name },
    });
  },
};

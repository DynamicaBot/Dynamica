import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { refreshSecondary } from "../lib/operations";
import { prisma } from "../lib/prisma";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Edit the template for all secondary channels.")
    .addChannelOption((option) =>
      option
        .setName("primary")
        .setDescription("The primary channel to change the template for.")
        .setRequired(true)
        .addChannelType(2)
    )
    .addStringOption((option) =>
      option
        .setName("template")
        .setDescription("The new template for all secondary channels.")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const primary = interaction.options.getChannel("primary", true);
    const name = interaction.options.getString("template", true);
    const channelConfig = await prisma.primary.findUnique({
      where: { id: primary?.id },
      include: { secondaries: true },
    });
    if (!channelConfig) return;
    await prisma.primary.update({
      where: { id: primary.id },
      data: { template: name },
    });
  },
};

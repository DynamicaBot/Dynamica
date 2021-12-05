import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { createPrimary } from "../lib/operations/primary";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel."),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      await interaction.reply({
        content: "Bot requires manage channel permissions.",
      });
      return;
    }

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

    await createPrimary(interaction.guild.channels, interaction.user.id);
    await interaction.reply({
      content: `New voice channel successfully created.`,
    });
  },
};

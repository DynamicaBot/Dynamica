import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("Edit the name of the current channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new name of the channel (can be a template).")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    console.log("blank");
    const name = interaction.options.getString("name");
    const user = await interaction.guild?.members.fetch(interaction.user.id);
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
    const channel = user?.voice.channel;
    if (!channel) {
      await interaction.reply("Must be in a voice channel channel.");
    } else {
      const channelConfig = await prisma.secondary.findUnique({
        where: {
          id: channel.id,
        },
      });
      if (!channelConfig) {
        await interaction.reply("Not a valid secondary channel.");
      } else {
        await prisma.secondary.update({
          where: { id: channel.id },
          data: {
            name,
          },
        });
        await interaction.reply(
          "Success. Channel may take up to 5 minutes to update."
        ); // TODO: Run update channel command.
      }
    }
  },
};

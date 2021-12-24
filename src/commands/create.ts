import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildChannel } from "discord.js";
import { checkGuild } from "../lib/checks/guild";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { createPrimary } from "../lib/operations/primary";
import { Command } from "./command";

export const create: Command = {
  conditions: [checkPermissions, checkGuild],
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel.")
    .addChannelOption((option) =>
      option
        .addChannelType(4)
        .setName("section")
        .setDescription(
          "A section that the voice channel should be created under."
        )
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    const section = interaction.options.getChannel(
      "section"
    ) as GuildChannel | null;
    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Bot requires manage channel permissions.")],
      });
      return;
    }

    await createPrimary(
      interaction.guild.channels,
      interaction.user.id,
      section
    );
    await interaction.reply({
      embeds: [SuccessEmbed(`New voice channel successfully created.`)],
    });
  },
};

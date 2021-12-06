import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildChannel } from "discord.js";
import { createPrimary } from "../lib/operations/primary";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";

module.exports = {
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
        embeds: [
          ErrorEmbed(
            "Must have the Dynamica role to create a primary channel."
          ),
        ],
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

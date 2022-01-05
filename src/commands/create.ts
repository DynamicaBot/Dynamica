import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildChannel } from "discord.js";
import { checkManager } from "../lib/conditions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { createPrimary } from "../lib/operations/primary";
import { CommandBuilder } from "./";

export const create = new CommandBuilder()
  .setConditions([checkManager])
  .setData(
    new SlashCommandBuilder()
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
      )
  )
  .setResponse(async (interaction) => {
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
  });

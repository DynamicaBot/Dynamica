import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildChannel } from "discord.js";
import Command from "../classes/command.js";
import { checkManager } from "../utils/conditions/index.js";
import { ErrorEmbed } from "../utils/discordEmbeds.js";
import { createPrimary } from "../utils/operations/primary.js";

export const create = new Command()
  .setPreconditions([checkManager])
  .setCommandData(
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
  .setHelpText(
    "It creates a new Primary channel which your users are able to join in order to create more secondary channels."
  )
  .setResponse(async (interaction) => {
    const section = interaction.options.getChannel(
      "section"
    ) as GuildChannel | null;

    if (!interaction.guild?.me?.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Bot requires manage channel permissions.")],
      });
    }

    const newPrimary = await createPrimary(
      interaction.guild.channels,
      interaction.user.id,
      section
    );

    return interaction.reply(
      `New voice channel <#${newPrimary.id}> successfully created.`
    );
  });

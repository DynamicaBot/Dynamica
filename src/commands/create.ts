import Command from "@classes/command";
import DynamicaPrimary from "@classes/primary";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager } from "@preconditions";
import { ErrorEmbed } from "@utils/discordEmbeds";
import { GuildChannel } from "discord.js";

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

    const newPrimary = new DynamicaPrimary(interaction.client);
    await newPrimary.create(interaction.guild, interaction.user, section);

    return interaction.reply(
      `New voice channel <#${newPrimary.id}> successfully created.`
    );
  });

import { Embed, quote, SlashCommandBuilder } from "@discordjs/builders";
import checkGuild from "@lib/checks/guild";
import { checkPermissions } from "@lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "@lib/discordEmbeds";
import { deleteAlias, listAliases, updateAlias } from "@lib/operations/alias";
import { CommandInteraction } from "discord.js";
import { Command } from "./command";

// Set General Template
export const alias: Command = {
  data: new SlashCommandBuilder()
    .setName("alias")
    .setDescription("Manage aliases.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a new alias.")
        .addStringOption((option) =>
          option
            .setName("activity")
            .setRequired(true)
            .setDescription("The target activity.")
        )
        .addStringOption((option) =>
          option
            .setName("alias")
            .setDescription("The alias the game should be known by.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove an alias.")
        .addStringOption((option) =>
          option
            .setName("activity")
            .setDescription(
              "Name of the activity you want to reset the alias for."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List currently set aliases.")
    ),

  async execute(interaction: CommandInteraction) {
    await checkGuild(interaction.guild?.id);
    if (!interaction.guild?.members) return;

    if (!(await checkPermissions(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
      });
      return;
    }

    if (interaction.options.getSubcommand() === "add") {
      const activity = interaction.options.getString("activity", true);
      const alias = interaction.options.getString("alias", true);

      await updateAlias(activity, alias, interaction.guildId);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(
            `Successfully created alias ${quote(alias)} for ${quote(activity)}`
          ),
        ],
      });
    } else if (interaction.options.getSubcommand() === "remove") {
      const activity = interaction.options.getString("activity", true);

      await deleteAlias(activity, interaction.guildId);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(`Successfully removed alias for ${quote(activity)}`),
        ],
      });
    } else if (interaction.options.getSubcommand() === "list") {
      const aliases = await listAliases(interaction.guildId);

      await interaction.reply({
        ephemeral: true,
        embeds: [new Embed().addFields(...aliases).setTitle("Alias List")],
      });
    }
  },
};

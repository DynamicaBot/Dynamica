import { Embed, quote, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import checkGuild from "../lib/checks/guild";
import { checkPermissions } from "../lib/checks/permissions";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { prisma } from "../lib/prisma";
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
      const existingAlias = await prisma.alias.findFirst({
        where: {
          activity,
          guildId: interaction.guild.id,
        },
      });

      if (!existingAlias) {
        await prisma.alias.create({
          data: {
            guildId: interaction.guild.id,
            activity,
            alias,
          },
        });
      } else {
        await prisma.alias.update({
          where: {
            id: existingAlias.id,
          },
          data: {
            activity,
            alias,
          },
        });
      }

      await interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(
            `Successfully created alias ${quote(alias)} for ${quote(activity)}`
          ),
        ],
      });
    } else if (interaction.options.getSubcommand() === "remove") {
      // await interaction.deferReply();
      const activity = interaction.options.getString("activity", true);
      await prisma.alias.deleteMany({
        where: {
          guildId: interaction.guild.id,
          activity,
        },
      });
      await interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(`Successfully removed alias for ${quote(activity)}`),
        ],
      });
    } else if (interaction.options.getSubcommand() === "list") {
      const aliases = await prisma.alias.findMany({
        where: {
          guildId: interaction.guild.id,
        },
      });
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new Embed()
            .addFields(
              ...aliases.map((alias) => ({
                name: alias.activity,
                value: alias.alias,
              }))
            )
            .setTitle("Alias List"),
        ],
      });
    }
  },
};

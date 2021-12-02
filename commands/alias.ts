import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import { prisma } from "../lib/prisma";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("alias")
    .setDescription("Manage aliases.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a new alias.")
        .addChannelOption((channel) =>
          channel
            .addChannelType(2)
            .setRequired(true)
            .setName("primary")
            .setDescription("The target channel.")
        )
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
        .addChannelOption((channel) =>
          channel
            .addChannelType(2)
            .setRequired(true)
            .setName("primary")
            .setDescription("The target channel.")
        )
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
      subcommand
        .setName("list")
        .setDescription("List currently set aliases.")
        .addChannelOption((channel) =>
          channel
            .addChannelType(2)
            .setRequired(true)
            .setName("primary")
            .setDescription("The target channel.")
        )
    ),

  async execute(interaction: CommandInteraction) {
    if (interaction.options.getSubcommand() === "add") {
      await interaction.deferReply();
      const activity = interaction.options.getString("activity", true);
      const alias = interaction.options.getString("alias", true);
      const primary = interaction.options.getChannel("primary", true);
      const existingAliase = await prisma.alias.findFirst({
        where: {
          activity,
          primaryId: primary.id,
        },
      });
      if (!existingAliase) {
        await prisma.alias.create({
          data: {
            primaryId: primary.id,
            activity,
            alias,
          },
        });
      } else {
        await prisma.alias.update({
          where: {
            id: existingAliase.id,
          },
          data: {
            primaryId: primary.id,
            activity,
            alias,
          },
        });
      }

      await interaction.editReply("Success");
    } else if (interaction.options.getSubcommand() === "remove") {
      await interaction.deferReply();
      const activity = interaction.options.getString("activity", true);
      const primary = interaction.options.getChannel("primary", true);
      await prisma.alias.deleteMany({
        where: {
          primaryId: primary.id,
          activity,
        },
      });
      await interaction.editReply("Success");
    } else if (interaction.options.getSubcommand() === "list") {
      await interaction.deferReply();
      const primary = interaction.options.getChannel("primary", true);
      const aliases = await prisma.alias.findMany({
        where: {
          primaryId: primary.id,
        },
      });
      await interaction.editReply({
        content: "Success",
        embeds: [
          new Embed()
            .addFields(
              ...aliases.map((alias) => ({
                name: alias.activity,
                value: alias.alias,
              }))
            )
            .setDescription("A list of aliases for the selected channel."),
        ],
      });
    }
  },
};

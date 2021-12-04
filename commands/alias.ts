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
    const primary = interaction.options.getChannel("primary", true);
    const channelConfig = await prisma.primary.findUnique({
      where: {
        id: primary.id,
      },
    });
    const guildMember = await interaction.guild?.members.cache.get(
      interaction.user.id
    );
    if (
      guildMember?.roles.cache.some((role) => role.name !== "Dynamica Manager")
    ) {
      interaction.reply({
        ephemeral: true,
        content: "Must have the Dynamica role to manage aliases.",
      });
      return;
    }
    if (!channelConfig) {
      interaction.reply("Must be a valid primary channel.");
    } else {
      if (interaction.options.getSubcommand() === "add") {
        const activity = interaction.options.getString("activity", true);
        const alias = interaction.options.getString("alias", true);
        const existingAlias = await prisma.alias.findFirst({
          where: {
            activity,
            primaryId: primary.id,
          },
        });
        if (!existingAlias) {
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
              id: existingAlias.id,
            },
            data: {
              primaryId: primary.id,
              activity,
              alias,
            },
          });
        }

        await interaction.reply("Success");
      } else if (interaction.options.getSubcommand() === "remove") {
        // await interaction.deferReply();
        const activity = interaction.options.getString("activity", true);
        await prisma.alias.deleteMany({
          where: {
            primaryId: primary.id,
            activity,
          },
        });
        await interaction.reply("Success");
      } else if (interaction.options.getSubcommand() === "list") {
        // await interaction.deferReply();
        const aliases = await prisma.alias.findMany({
          where: {
            primaryId: primary.id,
          },
        });
        await interaction.reply({
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
    }
    // await interaction.deferReply();
  },
};

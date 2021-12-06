import { Embed, quote, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
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
    // const primary = interaction.options.getChannel("primary", true);
    const cachedUser = interaction.guild?.members.cache.get(
      interaction.user.id
    );
    const user = cachedUser
      ? cachedUser
      : await interaction.guild?.members.fetch(interaction.user.id);
    const secondaryId = user?.voice.channelId;
    if (!secondaryId) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
      });
      return;
    }
    const secondaryConfig = await prisma.secondary.findUnique({
      where: {
        id: secondaryId,
      },
      include: {
        primary: true,
      },
    });
    if (!secondaryConfig) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be in a Dynamica-controlled voice channel.")],
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
        embeds: [ErrorEmbed("Must have the Dynamica role to manage aliases.")],
      });

      return;
    }
    if (!secondaryConfig.primary) {
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Must be a valid primary channel.")],
      });
    } else {
      if (interaction.options.getSubcommand() === "add") {
        const activity = interaction.options.getString("activity", true);
        const alias = interaction.options.getString("alias", true);
        const existingAlias = await prisma.alias.findFirst({
          where: {
            activity,
            primaryId: secondaryConfig.primary.id,
          },
        });
        if (!existingAlias) {
          await prisma.alias.create({
            data: {
              primaryId: secondaryConfig.primary.id,
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
              primaryId: secondaryConfig.primary.id,
              activity,
              alias,
            },
          });
        }

        await interaction.reply({
          ephemeral: true,
          embeds: [
            SuccessEmbed(
              `Successfully created alias ${quote(alias)} for ${quote(
                activity
              )}`
            ),
          ],
        });
      } else if (interaction.options.getSubcommand() === "remove") {
        // await interaction.deferReply();
        const activity = interaction.options.getString("activity", true);
        await prisma.alias.deleteMany({
          where: {
            primaryId: secondaryConfig.primary.id,
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
        // await interaction.deferReply();
        const aliases = await prisma.alias.findMany({
          where: {
            primaryId: secondaryConfig.primary.id,
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
    }
    // await interaction.deferReply();
  },
};

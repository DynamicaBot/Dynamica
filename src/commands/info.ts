import Command from "@classes/command";
import DynamicaPrimary from "@classes/primary";
import DynamicaSecondary from "@classes/secondary";
import db from "@db";
import { Embed, SlashCommandBuilder } from "@discordjs/builders";

export const info = new Command()
  .setCommandData(
    new SlashCommandBuilder()
      .setName("info")
      .setDescription("Get info about a primary or secondary channel.")
      .addSubcommand(subcommand =>
        subcommand
          .setName("primary")
          .addStringOption(option =>
            option
              .setAutocomplete(true)
              .setName("primarychannel")
              .setDescription("Primary channel to get info about.")
          )
          .setDescription("Get info about a primary channel.")
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName("secondary")
          .addStringOption(option =>
            option
              .setAutocomplete(true)
              .setName("secondarychannel")
              .setDescription("Secondary channel to get info about.")
          )
          .setDescription("Get info about a secondary channel.")
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName("guild")
          .setDescription("Get info about the guil's settings.")
      )
  )
  .setHelpText("Shows the info of either a user or the current server.")
  .setResponse(async interaction => {
    const subcommand = interaction.options.getSubcommand(true);
    switch (subcommand) {
      case "primary":
        const chosenPrimary = interaction.options.getString("primarychannel");
        const primary = await new DynamicaPrimary(
          interaction.client,
          chosenPrimary
        ).fetch();
        interaction.reply({
          ephemeral: true,
          content: `Here's the current info for <#${primary.id}>`,
          embeds: [
            new Embed().addFields(
              {
                name: "General Template",
                value: primary.prisma.generalName,
              },
              {
                name: "Activity Template",
                value: primary.prisma.template,
              },
              {
                name: "# of Secondary channels",
                value: primary.prisma.secondaries.length.toString(),
              }
            ),
          ],
        });
        // logger.debug(chosenPrimary);
        break;
      case "secondary":
        const chosenSecondary =
          interaction.options.getString("secondarychannel");
        const secondary = await new DynamicaSecondary(
          interaction.client,
          chosenSecondary
        ).fetch();
        interaction.reply({
          ephemeral: true,
          content: `Here's the current info for <#${secondary.id}>`,
          embeds: [
            new Embed().addFields(
              {
                name: "Name Override",
                value: secondary.prisma.name ?? "`Not set`",
              },
              {
                name: "Locked",
                value: secondary.prisma.locked
                  ? "🔒 - Locked"
                  : "🔓 - Unlocked",
              },
              {
                name: "Owner",
                value: (
                  await interaction.guild.members.cache.get(
                    secondary.prisma.creator
                  )
                ).user.tag,
              }
            ),
          ],
        });
        break;
      case "guild":
        const prismaGuild = await db.guild.findUnique({
          where: { id: interaction.guildId },
        });
        interaction.reply({
          ephemeral: true,
          content: `Here's the current info for the guild`,
          embeds: [
            new Embed().addFields(
              {
                name: "Text Channels",
                value: prismaGuild.textChannelsEnabled ? "Enabled" : "Disabled",
              },
              {
                name: "Join Requests",
                value: prismaGuild.allowJoinRequests ? "Enabled" : "Disabled",
              }
            ),
          ],
        });
        break;
      default:
        break;
    }
  });

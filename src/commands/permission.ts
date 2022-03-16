import { SlashCommandBuilder } from "@discordjs/builders";
import { Role } from "discord.js";
import { Command } from ".";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { ErrorEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

export const permission = new Command()
  .setPreconditions([checkCreator, checkSecondary, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("permission")
      .setDescription("Edit the permissions of a voice channel.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription(
            "Give permissions for the current voice channel for a role or user."
          )
          .addRoleOption((option) =>
            option
              .setDescription("The role to add.")
              .setName("role")
              .setRequired(false)
          )
          .addUserOption((option) =>
            option
              .setDescription("The user to add.")
              .setName("user")
              .setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription(
            "Remove permissions for the current voice channel for a role or user."
          )
          .addRoleOption((option) =>
            option
              .setDescription("The role to remove.")
              .setName("role")
              .setRequired(false)
          )
          .addUserOption((option) =>
            option
              .setDescription("The user to remove.")
              .setName("user")
              .setRequired(false)
          )
      )
  )
  .setHelpText(
    "Edits the permissions for secondary channels. (Works in conjuction with /lock and /unlock."
  )
  .setResponse(async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);
    const user = interaction.options.getUser("user", false);
    const role = interaction.options.getRole("role", false) as Role;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;
    const { permissionOverwrites } = channel;
    if (!user && !role) {
      return interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("You must specify either a role or user.")],
      });
    }

    if (interaction.user === user) {
      return interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed(`You add yourself silly. You're already added.`)],
      });
    }

    if (subcommand === "add") {
      permissionOverwrites.create(user || role, { CONNECT: true });
      return interaction.reply({
        ephemeral: true,
        content: `You've added permission for ${
          user ? `<@${user.id}>` : `<@&${role.id}>`
        } to access <#${channel.id}>.`,
      });
    } else if (subcommand === "remove") {
      permissionOverwrites.create(user || role, { CONNECT: false });
      return interaction.reply({
        ephemeral: true,
        content: `You've removed permission for ${
          user ? `<@${user.id}>` : `people with the role <@&${role.id}>`
        } to access the <#${channel.id}>.`,
      });
    }
  });

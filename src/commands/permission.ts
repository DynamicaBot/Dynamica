import { SlashCommandBuilder } from "@discordjs/builders";
import { Role } from "discord.js";
import { Command } from "../Command";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { ErrorEmbed, SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

export const permission: Command = {
  conditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data: new SlashCommandBuilder()
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
    ),
  helpText: {
    short:
      "Edits the permissions for secondary channels. (Works in conjuction with /lock and /unlock.",
  },
  async execute(interaction) {
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
        embeds: [
          ErrorEmbed(
            `You ${
              subcommand === "add" ? "add" : "remove"
            } yourself silly. You're already added.`
          ),
        ],
      });
    }

    if (subcommand === "add") {
      permissionOverwrites.create(user || role, { CONNECT: true });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(
            `You've added permission for ${
              user ? `<@${user.id}>` : `<@&${role.id}>`
            } to access the channel you're in.`
          ),
        ],
      });
    } else if (subcommand === "remove") {
      permissionOverwrites.create(user || role, { CONNECT: false });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          SuccessEmbed(
            `You've removed permission for ${
              user ? `<@${user.id}>` : `people with the role <@&${role.id}>`
            } to access the channel you're in.`
          ),
        ],
      });
    }
  },
};

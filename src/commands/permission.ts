import { SlashCommandBuilder } from "@discordjs/builders";
import { Role } from "discord.js";
import { checkCreator, checkSecondary } from "../lib/checks";
import { ErrorEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { Command } from "./command";

export const permission: Command = {
  conditions: [checkCreator, checkSecondary],
  data: new SlashCommandBuilder()
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
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand(true);
    const user = interaction.options.getUser("user", false);
    const role = interaction.options.getRole("role", false);
    if (!(role instanceof Role)) return;
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );
    const channel = guildMember?.voice.channel;
    const { permissionOverwrites } = channel;
    if (!user && !role) {
      if (interaction.user === user) {
        interaction.reply({
          ephemeral: true,
          embeds: [ErrorEmbed("You add yourself silly. You're already added.")],
        });
        return;
      }
      interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("You must specify either a role or user.")],
      });
      return;
    }
    if (subcommand === "add") {
      permissionOverwrites.create(user || role, { CONNECT: true });
    } else if (subcommand === "remove") {
      if (interaction.user === user) {
        interaction.reply({
          ephemeral: true,
          embeds: [
            ErrorEmbed(
              "You can't remove yourself silly. Transfer ownership of the channel and get them to do it."
            ),
          ],
        });
        return;
      }
      permissionOverwrites.create(user || role, { CONNECT: false });
    }
  },
};

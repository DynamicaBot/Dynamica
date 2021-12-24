import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkOwner } from "../lib/checks/owner";
import { checkSecondary } from "../lib/checks/validSecondary";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { logger } from "../lib/logger";
import { Command } from "./command";

// Set lock Template
export const lock: Command = {
  conditions: [checkOwner, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel to a certain role or user.")
    .addStringOption((option) =>
      option
        .addChoices([
          ["add", "add"],
          ["remove", "remove"],
        ])
        .setRequired(true)
        .setDescription("Add or Remove permissions.")
        .setName("operation")
    )
    .addRoleOption((option) =>
      option
        .setDescription("The role add or remove.")
        .setName("role")
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");
    const role = interaction.options.getRole("role");
    const operation = interaction.options.getString("operation", true) as
      | "add"
      | "remove";

    if (!interaction.guild?.members) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const everyone = interaction.guild?.roles.everyone;
    const channel = guildMember?.voice.channel;

    if (!channel) return;

    const { permissionOverwrites } = channel;

    if (operation === "remove") {
      if (role) {
        await permissionOverwrites.delete(role.id);
        await interaction.reply({
          embeds: [
            SuccessEmbed(
              `Removed permission for ${role.name} to access ${channel.name}.`
            ),
          ],
        });
      } else {
        await permissionOverwrites.set([]);
        await interaction.reply({
          embeds: [SuccessEmbed(`Removed lock on ${channel.name}`)],
        });
      }
    } else if (operation === "add") {
      if (role) {
        if (everyone) {
          await permissionOverwrites.create(everyone.id, { CONNECT: false });
        }
        await permissionOverwrites.create(interaction.user.id, {
          CONNECT: true,
        });
        await permissionOverwrites.create(role.id, { CONNECT: true });
        await interaction.reply({
          embeds: [
            SuccessEmbed(`Locked channel ${channel.name} to ${role.name}.`),
          ],
        });
      } else {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            ErrorEmbed(`No role specified to add channel permissions to.`),
          ],
        });
      }
    }

    logger.info(`${channel.id} name changed.`);
  },
};

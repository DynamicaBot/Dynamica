import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { bree } from "../utils/bree";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { db } from "../utils/db";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

export const lock: Command = {
  conditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel to a certain role or user."),

  async execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild?.members) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const everyone = interaction.guild?.roles.everyone;
    const channel = guildMember?.voice.channel;
    const currentlyActive = [...channel.members.values()];

    const { permissionOverwrites } = channel;

    Promise.all(
      currentlyActive.map((member) =>
        permissionOverwrites.create(member.id, {
          CONNECT: true,
        })
      )
    ).then(() => {
      if (everyone) {
        permissionOverwrites.create(everyone.id, { CONNECT: false });
      }
    });

    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Use \`/permission add\` to allow people to access the channels. Or, \`/permission remove\` to remove people.`
        ),
      ],
    });
    await db.secondary.update({
      where: { id: channel.id },
      data: {
        locked: true,
      },
    });
    bree.run(channel.id);
  },
};

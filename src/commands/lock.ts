import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { bree } from "..";
import { Command } from "../Command";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { db } from "../utils/prisma";

export const lock: Command = {
  conditions: [checkCreator, checkSecondary],
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

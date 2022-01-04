import { SlashCommandBuilder } from "@discordjs/builders";
import type Bree from "bree";
import { CommandInteraction } from "discord.js";
import { container } from "tsyringe";
import { checkCreator, checkSecondary } from "../lib/checks/index.js";
import { SuccessEmbed } from "../lib/discordEmbeds.js";
import { getGuildMember } from "../lib/getCached.js";
import { db } from "../lib/prisma.js";
import { kBree } from "../tokens.js";
import { Command } from "./command.js";

export const lock: Command = {
  conditions: [checkCreator, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel to a certain role or user."),
  async execute(interaction: CommandInteraction) {
    const bree = container.resolve<Bree>(kBree);
    if (!interaction.guild?.members) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const everyone = interaction.guild?.roles.everyone;
    const channel = guildMember?.voice.channel;

    const { permissionOverwrites } = channel;

    if (everyone) {
      await permissionOverwrites.create(everyone.id, { CONNECT: false });
    }

    await permissionOverwrites.create(interaction.user.id, {
      CONNECT: true,
    });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Only you can access this channel now. Use \`/permission add\` to allow people to access the channels.`
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

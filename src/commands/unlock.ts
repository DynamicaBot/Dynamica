import { SlashCommandBuilder } from "@discordjs/builders";
import type Bree from "bree";
import { container } from "tsyringe";
import { checkCreator, checkSecondary } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { db } from "../lib/prisma";
import { kBree } from "../tokens";
import { Command } from "./";

export const unlock: Command = {
  conditions: [checkSecondary, checkCreator],
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Remove any existing locks on locked secondary channels."),
  async execute(interaction) {
    const bree = container.resolve<Bree>(kBree);
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    await db.secondary.update({
      where: { id: channel.id },
      data: {
        locked: false,
      },
    });
    bree.run(channel.id);

    await channel.lockPermissions();
    await interaction.reply({
      ephemeral: true,
      embeds: [SuccessEmbed(`Removed lock on <#${channel.id}>`)],
    });
  },
};

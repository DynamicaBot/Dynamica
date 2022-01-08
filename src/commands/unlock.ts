import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { bree } from "..";
import { Command } from "../Command";
import { checkCreator } from "../utils/conditions";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { db } from "../utils/prisma";

export const unlock: Command = {
  conditions: [checkCreator],
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Remove any existing locks on locked secondary channels."),

  async execute(interaction: CommandInteraction): Promise<void> {
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

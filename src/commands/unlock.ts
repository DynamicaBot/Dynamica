import { SlashCommandBuilder } from "@discordjs/builders";
import type Bree from "bree";
import { container } from "tsyringe";
import { checkCreator, checkSecondary } from "../lib/checks/index.js";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds.js";
import { getGuildMember } from "../lib/getCached.js";
import { db } from "../lib/prisma.js";
import { kBree } from "../tokens.js";
import { Command } from "./command.js";

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

    if (!channel) {
      interaction.reply({
        ephemeral: true,
        embeds: [
          ErrorEmbed(
            "You need to be a member of the secondary channel in order to unlock it."
          ),
        ],
      });
      return;
    }

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

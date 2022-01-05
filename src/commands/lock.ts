import { SlashCommandBuilder } from "@discordjs/builders";
import type Bree from "bree";
import { CommandInteraction } from "discord.js";
import { container } from "tsyringe";
import { checkCreator, checkSecondary } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { db } from "../lib/prisma";
import { kBree } from "../tokens";
import { CommandBuilder } from "./";

export const lock = new CommandBuilder()
  .setConditions([checkCreator, checkSecondary])
  .setData(
    new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Lock a channel to a certain role or user.")
  )
  .setResponse(async (interaction: CommandInteraction) => {
    const bree = container.resolve<Bree>(kBree);
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
  });

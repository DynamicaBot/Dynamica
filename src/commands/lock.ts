import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { db } from "../utils/db";
import { getGuildMember } from "../utils/getCached";
import { editChannel } from "../utils/operations/secondary";

export const lock: Command = {
  conditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel to a certain role or user."),
  helpText: {
    short: "Use it to lock your channels away from pesky server members.",
    long: "Use it to lock your channels away from pesky server members. Locks it to the creator (initially) and permissions can be altered with /permission. \n Channels can be reset to default with /unlock.",
  },
  async execute(interaction) {
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

    await db.secondary.update({
      where: { id: channel.id },
      data: {
        locked: true,
      },
    });
    editChannel({ channel });

    return interaction.reply({
      ephemeral: true,
      content: `Use \`/permission add\` to allow people to access the channels. Or, \`/permission remove\` to remove people.`,
    });
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkCreator, checkSecondary } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { getGuildMember } from "../utils/getCached.js";
import { editChannel } from "../utils/operations/secondary.js";

export const lock = new Command()
  .setPreconditions([checkCreator, checkSecondary, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Lock a channel to a certain role or user.")
  )
  .setHelpText(
    "Use it to lock your channels away from pesky server members.",
    "Use it to lock your channels away from pesky server members. Locks it to the creator (initially) and permissions can be altered with /permission. \n Channels can be reset to default with /unlock."
  )
  .setResponse(async (interaction) => {
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
  });

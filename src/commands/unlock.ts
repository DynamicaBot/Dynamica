import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkCreator } from "../utils/conditions";
import { checkAdminPermissions } from "../utils/conditions/admin";
import { db } from "../utils/db";
import { ErrorEmbed, SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { editChannel } from "../utils/operations/secondary";

export const unlock: Command = {
  conditions: [checkCreator, checkAdminPermissions],
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Remove any existing locks on locked secondary channels."),
  helpText: {
    short:
      "This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission.",
  },
  async execute(interaction) {
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (channel.manageable) {
      channel.lockPermissions();
      db.secondary.update({
        where: { id: channel.id },
        data: {
          locked: false,
        },
      });

      await editChannel({ channel });
      return interaction.reply({
        ephemeral: true,
        embeds: [SuccessEmbed(`Removed lock on <#${channel.id}>`)],
      });
    } else {
      return interaction.reply({
        embeds: [ErrorEmbed("Couldn't edit channel.")],
      });
    }
  },
};

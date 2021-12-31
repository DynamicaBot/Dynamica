import { SlashCommandBuilder } from "@discordjs/builders";
import { checkCreator, checkSecondary } from "../lib/checks";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { Command } from "./command";

export const unlock: Command = {
  conditions: [checkSecondary, checkCreator],
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Remove any existing locks on locked secondary channels."),
  async execute(interaction) {
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

    await channel.lockPermissions();
    await interaction.reply({
      ephemeral: true,
      embeds: [SuccessEmbed(`Removed lock on <#${channel.id}>`)],
    });
  },
};

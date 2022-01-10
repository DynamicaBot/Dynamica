import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkCreator, checkSecondary } from "../utils/conditions";
import { ErrorEmbed, SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";

export const limit: Command = {
  conditions: [checkCreator, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("limit")
    .setDescription(
      "Edit the max number of people allowed in the current channel"
    )
    .addIntegerOption((option) =>
      option
        .setDescription(
          "The maximum number of people that are allowed to join the channel."
        )
        .setName("number")
        .setRequired(true)
    ),
  helpText: { short: "Limit the maximum number of people in the channel." },
  async execute(interaction) {
    const userLimit = interaction.options.getInteger("number", true);

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel.manageable) {
      return interaction.reply({
        embeds: [ErrorEmbed("Cannot edit channel.")],
      });
    } else {
      channel.edit({ userLimit });
      return interaction.reply({
        embeds: [SuccessEmbed(`Channel limit changed to ${userLimit}.`)],
      });
    }
  },
};

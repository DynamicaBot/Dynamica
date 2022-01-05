import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandBuilder } from "../lib/builders";
import { checkCreator, checkSecondary } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";

export const limit = new CommandBuilder()
  .setConditions([checkSecondary, checkCreator])
  .setData(
    new SlashCommandBuilder()
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
      )
  )
  .setResponse(async (interaction) => {
    const userLimit = interaction.options.getInteger("number", true);

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    await guildMember.voice.channel.edit({ userLimit });
    await interaction.reply({
      embeds: [SuccessEmbed(`Channel limit changed to ${userLimit}.`)],
    });
  });

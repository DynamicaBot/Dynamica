import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from ".";
import { checkCreator } from "../utils/conditions";
import { db } from "../utils/db";
import { getGuildMember } from "../utils/getCached";

export const transfer = new Command()
  .setPreconditions([checkCreator])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("transfer")
      .setDescription(
        "Transfer ownership of secondary channel to another person"
      )
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The person to transfer ownership to.")
          .setRequired(true)
      )
  )
  .setHelpText("Transfer ownership to another user.")
  .setResponse(async (interaction) => {
    const user = interaction.options.getUser("user", true);

    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (!channel) return;

    // set new owner
    db.secondary.update({
      where: {
        id: channel.id,
      },
      data: {
        creator: user.id,
      },
    });
    interaction.reply(
      `Ownership of <#${channel.id}> channel to <@${user.id}>.`
    );
  });

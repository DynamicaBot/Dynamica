import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import DynamicaSecondary from "../classes/secondary.js";
import { checkCreator } from "../utils/conditions/index.js";
import { getGuildMember } from "../utils/getCached.js";

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

    const { channelId } = guildMember.voice;

    const secondaryChannel = await new DynamicaSecondary(
      interaction.client,
      channelId
    ).fetch();
    if (secondaryChannel) {
      await secondaryChannel.changeOwner(user);
      interaction.reply(
        `Ownership of <#${channelId}> channel to <@${user.id}>.`
      );
    } else {
      interaction.reply(`Not a valid secondary channel.`);
    }
  });

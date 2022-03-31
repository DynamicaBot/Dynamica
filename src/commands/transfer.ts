import Command from "@classes/command";
import DynamicaSecondary from "@classes/secondary";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkCreator } from "@preconditions";

export const transfer = new Command()
  .setPreconditions([checkCreator])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("transfer")
      .setDescription(
        "Transfer ownership of secondary channel to another person"
      )
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("The person to transfer ownership to.")
          .setRequired(true)
      )
  )
  .setHelpText("Transfer ownership to another user.")
  .setResponse(async interaction => {
    const user = interaction.options.getUser("user", true);

    const guildMember = await interaction.guild.members.cache.get(
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

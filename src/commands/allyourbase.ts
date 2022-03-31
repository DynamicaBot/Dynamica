import Command from "@classes/command.js";
import DynamicaSecondary from "@classes/secondary.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager, checkSecondary } from "@preconditions";

export const allyourbase = new Command()
  .setPreconditions([checkManager, checkSecondary])
  .setHelpText(
    "Transfers the ownership of the current channel to the person who ran the command. (Must be an admin)"
  )
  .setCommandData(
    new SlashCommandBuilder()
      .setName("allyourbase")
      .setDescription(
        "If you are an admin you become the owner of the channel you are in."
      )
  )
  .setResponse(async (interaction) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channelId } = guildMember.voice;
    const secondaryChannel = await new DynamicaSecondary(
      interaction.client,
      channelId
    ).fetch();

    if (secondaryChannel) {
      await secondaryChannel.changeOwner(interaction.user);
      await interaction.reply(
        `Owner of <#${channelId}> changed to <@${guildMember.user.id}>`
      );
    } else {
      await interaction.reply(`Must be a valid secondary channel.`);
    }
  });

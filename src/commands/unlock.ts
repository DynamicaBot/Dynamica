import Command from "@classes/command";
import DynamicaSecondary from "@classes/secondary";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkCreator } from "@preconditions";
import { checkAdminPermissions } from "@preconditions/admin";
import { ErrorEmbed } from "@utils/discordEmbeds.js";

export const unlock = new Command()
  .setPreconditions([checkCreator, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("unlock")
      .setDescription("Remove any existing locks on locked secondary channels.")
  )
  .setHelpText(
    "This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission."
  )
  .setResponse(async (interaction) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const { channelId } = guildMember.voice;

    const dynamicaSecondary = await new DynamicaSecondary(
      interaction.client,
      channelId
    ).fetch();

    if (dynamicaSecondary) {
      await dynamicaSecondary.unlock();
      await interaction.reply(`Removed lock on <#${channelId}>`);
    } else {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid Dynamica channel.")],
      });
    }
  });

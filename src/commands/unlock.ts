import help from '@/help/unlock';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import { ErrorEmbed } from '@utils/discordEmbeds';

export default new Command()
  .setPreconditions([checkCreator, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName('unlock')
      .setDescription('Remove any existing locks on locked secondary channels.')
  )
  .setHelp(help)
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
        embeds: [ErrorEmbed('Not a valid Dynamica channel.')],
      });
    }
  });

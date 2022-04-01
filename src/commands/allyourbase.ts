import help from '@/help/allyourbase';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import checkSecondary from '@preconditions/secondary';

export default new Command()
  .setPreconditions([checkManager, checkSecondary])
  .setHelp(help)
  .setCommandData(
    new SlashCommandBuilder()
      .setName('allyourbase')
      .setDescription(
        'If you are an admin you become the owner of the channel you are in.'
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
      await interaction.reply('Must be a valid secondary channel.');
    }
  });

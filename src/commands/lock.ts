import lock from '@/help/lock';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';

export default new Command()
  .setPreconditions([checkCreator, checkSecondary, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName('lock')
      .setDescription('Lock a channel to a certain role or user.')
  )
  .setHelp(lock)
  .setResponse(async (interaction) => {
    if (!interaction.guild?.members) return;

    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channelId = guildMember?.voice.channelId;

    const dynamicaSecondary = await new DynamicaSecondary(
      interaction.client,
      channelId
    ).fetch();

    if (dynamicaSecondary) {
      await dynamicaSecondary.lock();
      await interaction.reply({
        ephemeral: true,
        content:
          'Use `/permission add` to allow people to access the channels. Or, `/permission remove` to remove people.',
      });
    } else {
      interaction.reply({
        ephemeral: true,
        content: "This isn't a dynamica channel.",
      });
    }
  });

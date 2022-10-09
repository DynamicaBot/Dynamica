import Command from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import creatorCheck from '@/preconditions/creator';
import secondaryCheck from '@/preconditions/secondary';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import interactionDetails from '@/utils/mqtt';
import {
  CacheType,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class LockCommand extends Command {
  constructor() {
    super('lock');
  }

  conditions = [creatorCheck, secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('lock')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Lock a channel to a certain role or user.');

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channelId = guildMember?.voice.channelId;

    const dynamicaSecondary = Secondaries.get(channelId);

    dynamicaSecondary.lock(interaction.client);
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Use ${inlineCode(
            '/permission add'
          )} to allow people to access the channels. Or, ${inlineCode(
            '/permission remove'
          )} to remove people.`
        ),
      ],
    });
    this.publish({
      channel: dynamicaSecondary.id,
      ...interactionDetails(interaction),
    });
  };
}

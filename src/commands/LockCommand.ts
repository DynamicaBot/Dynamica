import Command, { CommandToken } from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import creatorCheck from '@/preconditions/creator';
import secondaryCheck from '@/preconditions/secondary';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import {
  CacheType,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class LockCommand implements Command {
  constructor(private logger: Logger, private secondaries: Secondaries) {}

  name = 'lock';

  conditions = [creatorCheck, secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('lock')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Lock a channel to a certain role or user.');

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channelId = guildMember?.voice.channelId;

    const dynamicaSecondary = await this.secondaries.get(channelId);

    dynamicaSecondary.lock();
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
  };
}

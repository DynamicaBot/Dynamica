import Command, { CommandToken } from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import creatorCheck from '@/preconditions/creator';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/utils/logger';
import DB from '@db';
import {
  CacheType,
  ChatInputCommandInteraction,
  inlineCode,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class NameCommand implements Command {
  constructor(
    private logger: Logger,
    private secondaries: Secondaries,
    private db: DB
  ) {}

  name = 'name';

  conditions = [creatorCheck];

  data = new SlashCommandBuilder()
    .setName('name')
    .setDMPermission(false)
    .setDescription('Edit the name of the current channel.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The new name of the channel (can be a template).')
        .setRequired(true)
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const name = interaction.options.getString('name');
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    await this.db.secondary.update({
      where: { id: channel.id },
      data: { name },
    });
    this.logger.info(`${channel.id} name changed.`);

    await this.secondaries.get(channel.id).update(interaction.client);

    interaction.reply({
      embeds: [SuccessEmbed(`Channel name changed to ${inlineCode(name)}.`)],
    });
  };
}

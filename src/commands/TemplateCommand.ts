import Command, { CommandToken } from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import DB from '@/services/DB';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class TemplateCommand implements Command {
  constructor(
    private logger: Logger,
    private secondaries: Secondaries,
    private db: DB
  ) {}

  name = 'template';

  conditions = [];

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const template = interaction.options.getString('template', true);
    const channel = interaction.options.getString('primary', true);

    const primary = await this.db.primary.update({
      where: { id: channel },
      data: { template },
      include: { secondaries: true },
    });

    primary.secondaries.forEach(async (secondary) => {
      const dynamicaSecondary = await this.secondaries.get(secondary.id);

      dynamicaSecondary.update();
    });

    interaction.reply({
      embeds: [
        SuccessEmbed(
          `Template for ${channelMention(channel)} changed to ${inlineCode(
            template
          )}.`
        ),
      ],
    });
  };

  data = new SlashCommandBuilder()
    .setName('template')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the template for all secondary channels.')
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName('primary')
        .setDescription('The channel to change the template for.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('template')
        .setDescription('The new template for all secondary channels.')
        .setRequired(true)
    );
}

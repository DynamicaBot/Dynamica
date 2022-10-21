import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import Secondaries from '@/classes/Secondaries';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import DB from '@/services/DB';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class GeneralCommand extends Command {
  constructor(
    private logger: Logger,
    private secondaries: Secondaries,
    private db: DB
  ) {
    super('general');
  }

  conditions: Condition[] = [];

  data = new SlashCommandBuilder()
    .setName('general')
    .setDefaultMemberPermissions('0')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the name/template for the default general channel.')
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName('primary')
        .setDescription('The channel to change the template for.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The new template for the general channel.')
        .setRequired(true)
    );

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const name = interaction.options.getString('name', true);
    const channel = interaction.options.getString('primary', true);

    const updatedPrimary = await this.db.primary.update({
      where: { id: channel },
      data: { generalName: name },
      include: { secondaries: true },
    });

    updatedPrimary.secondaries.forEach(async (secondary) => {
      await (await this.secondaries.get(secondary.id)).update();
    });

    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `General template for <#${channel}> changed to \`${name}\`.`
        ),
      ],
    });
  };
}

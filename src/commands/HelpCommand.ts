import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import Helps from '@/classes/Helps';
import { InfoEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class HelpCommand extends Command {
  constructor(private logger: Logger, private helps: Helps) {
    super('help');
  }

  conditions: Condition[] = [];

  data = new SlashCommandBuilder()
    .setName('help')
    .setDescription(
      'A help command that lists all commands available to users of the bot.'
    )
    .addStringOption((option) =>
      option
        .setRequired(false)
        .setName('help')
        .setDescription('Subcommand help')
        .setAutocomplete(true)
    );

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction) => {
    const subcommand = interaction.options.getString('help', false);
    if (subcommand) {
      const helpPage = this.helps.get(subcommand);
      const embed = new EmbedBuilder()
        .setAuthor({
          name: 'Dynamica',
          url: 'https://dynamica.dev',
          iconURL: 'https://dynamica.dev/img/dynamica.png',
        })
        .setColor(3066993)
        .setTitle(subcommand)
        .setFooter({
          text: `Find out more https://dynamica.dev/docs/commands/${subcommand}`,
        })
        .setDescription(helpPage.long ?? helpPage.short);
      interaction.reply({ embeds: [embed] });
    } else {
      const helpItems = this.helps.all;
      const helpPages: APIEmbedField[][] = _.chunk(
        helpItems.map((helpItem) => ({
          name: helpItem.name,
          value: helpItem.short,
          inline: true,
        })),
        25
      );

      interaction.reply({
        ephemeral: true,
        embeds: helpPages.map((helpPage, index) =>
          InfoEmbed("Information about Dynamica's commands.")
            .setTitle(`Help (${index + 1})`)
            .setFooter({
              text: 'Find out more https://dynamica.dev/docs/commands',
            })
            .addFields(helpPage)
        ),
      });
    }
  };
}

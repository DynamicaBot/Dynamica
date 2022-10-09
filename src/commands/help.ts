import Command from '@/classes/Command';
import Helps from '@/classes/Helps';
import { InfoEmbed } from '@/utils/discordEmbeds';
import interactionDetails from '@/utils/mqtt';
import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';

export default class HelpCommand extends Command {
  constructor() {
    super('help');
  }

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

  response = async (interaction) => {
    const subcommand = interaction.options.getString('help', false);
    if (subcommand) {
      const helpPage = Helps.get(subcommand);
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
      const helpItems = Helps.all;
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
      this.publish({ ...interactionDetails(interaction) });
    }
  };
}

import helpHelp from '@/help/help';
import Command from '@classes/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import helpForHelp from '@help';
import { EmbedBuilder } from 'discord.js';
import _ from 'lodash';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription(
    'A help command that lists all commands available to users of the bot.'
  )
  .addStringOption((option) =>
    option
      .setRequired(false)
      .setName('subcommand')
      .setDescription('Subcommand help')
      .setAutocomplete(true)
  );

const response = async (interaction) => {
  const subcommand = interaction.options.getString('subcommand', false);
  if (subcommand) {
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
      .setDescription(helpHelp.long ?? helpHelp.short);
    return interaction.reply({ embeds: [embed] });
  }
  const helps = Object.values(helpHelp);
  const helpFields: { value: string; name: string; inline: true }[][] = _.chunk(
    helps.map(() => ({
      name: subcommand,
      value: helpForHelp[subcommand].short,
      inline: true,
    })),
    25
  );
  return interaction.reply({
    embeds: helpFields.map((helpField) =>
      new EmbedBuilder()
        .setAuthor({
          name: 'Dynamica',
          url: 'https://dynamica.dev',
          iconURL: 'https://dynamica.dev/img/dynamica.png',
        })
        .setColor(3066993)
        .setTitle('Help')
        .setFooter({
          text: 'Find out more https://dynamica.dev/docs/commands',
        })
        .addFields(...helpField)
    ),
  });
};

export const help = new Command({ help: helpHelp, data, response });

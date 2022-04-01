import Command from '@classes/command';
import db from '@db';
import { Embed, SlashCommandBuilder } from '@discordjs/builders';
import help from '@help/alias';
import checkManager from '@preconditions/manager';
import { listAliases, updateAlias } from '@utils/alias';
import _ from 'lodash';

export default new Command()
  .setPreconditions([checkManager])
  .setHelp(help)
  .setCommandData(
    new SlashCommandBuilder()
      .setName('alias')
      .setDescription('Manage aliases.')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Add a new alias.')
          .addStringOption((option) =>
            option
              .setName('activity')
              .setRequired(true)
              .setDescription('The target activity.')
          )
          .addStringOption((option) =>
            option
              .setName('alias')
              .setDescription('The alias the game should be known by.')
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('remove')
          .setDescription('Remove an alias.')
          .addStringOption((option) =>
            option
              .setName('activity')
              .setDescription(
                'Name of the activity you want to reset the alias for.'
              )
              .setRequired(true)
              .setAutocomplete(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName('list').setDescription('List currently set aliases.')
      )
  )
  .setResponse(async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);
    const activity = interaction.options.getString('activity');
    if (subcommand === 'add') {
      const alias = interaction.options.getString('alias', true);
      await updateAlias(activity, alias, interaction.guildId);
      await interaction.reply(
        `Successfully created alias \`${alias}\` for \`${activity}\``
      );
    } else if (subcommand === 'remove') {
      const deletedAlias = await db.alias.delete({
        where: { id: parseInt(activity, 10) },
      });
      await interaction.reply(
        `Successfully removed alias for \`${deletedAlias.activity}\`.`
      );
    } else if (subcommand === 'list') {
      const aliases = await listAliases(interaction.guildId);
      const inlineAliases = aliases.map(({ name, value }) => ({
        name,
        value,
        inline: true,
      }));

      const embeds = _.chunk(inlineAliases, 25).map((result) =>
        new Embed().addFields(...result)
      );
      interaction.reply({
        content: 'Alias List',
        embeds,
      });
    }
  });

import DynamicaAlias from '@/classes/Alias';
import { MQTT } from '@/classes/MQTT';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import db from '@db';
import help from '@help/alias';
import checkManager from '@preconditions/manager';
import { listAliases } from '@utils/alias';
import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';

const data = new SlashCommandBuilder()
  .setName('alias')
  .setDescription('Manage aliases.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Add a new alias.')
      .addStringOption((option) =>
        option
          .setName('activity')
          .setRequired(true)
          .setAutocomplete(true)
          .setDescription('The target activity.')
      )
      .addStringOption((option) =>
        option
          .setName('alias')
          .setDescription('The alias the game should be known by.')
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
    subcommand
      .setName('update')
      .setDescription('Update an alias.')
      .addStringOption((option) =>
        option
          .setName('activity')
          .setDescription(
            'Name of the activity you want to update the alias for.'
          )
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('list').setDescription('List currently set aliases.')
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const subcommand = interaction.options.getSubcommand(true);
  console.log({ subcommand });
  const mqtt = MQTT.getInstance();
  if (subcommand === 'add') {
    const activity = interaction.options.getString('activity', true);
    const aliasName = interaction.options.getString('alias', true);

    await DynamicaAlias.findOrCreate(interaction.guildId, activity, aliasName);

    await interaction.reply(
      `Successfully created alias \`${alias}\` for \`${activity}\``
    );

    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      subcommand,
      activity,
      alias,
      ...interactionDetails(interaction),
    });
  } else if (subcommand === 'update') {
    const activity = interaction.options.getString('activity', true);
    const aliasName = interaction.options.getString('alias', true);
    DynamicaAlias.findOrCreate(interaction.guildId, activity, aliasName);

    await interaction.reply(
      `Successfully updated alias \`${aliasName}\` for \`${activity}\``
    );

    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      subcommand,
      activity,
      alias,
      ...interactionDetails(interaction),
    });
  } else if (subcommand === 'remove') {
    const activity = interaction.options.getString('activity', true);
    const deletedAlias = await db.alias.delete({
      where: { id: parseInt(activity, 10) },
    });
    await interaction.reply(
      `Successfully removed alias for \`${deletedAlias.activity}\`.`
    );

    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      subcommand,
      activity,
      ...interactionDetails(interaction),
    });
  } else if (subcommand === 'list') {
    const aliases = await listAliases(interaction.guildId);
    const inlineAliases = aliases.map(({ name, value }) => ({
      name,
      value,
      inline: true,
    }));

    const embeds = _.chunk(inlineAliases, 25).map((result) =>
      new EmbedBuilder().addFields(...result)
    );
    interaction.reply({
      content: 'Alias List',
      embeds,
    });

    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      subcommand,
      ...interactionDetails(interaction),
    });
  }
};

export const alias = new Command({
  preconditions: [checkManager],
  help,
  data,
  response,
});

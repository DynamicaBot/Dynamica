import DynamicaAlias from '@/classes/Alias';
import Aliases from '@/classes/Aliases';
import Command from '@/classes/Command';
import { ErrorEmbed, SuccessEmbed } from '@/utils/discordEmbeds';
import interactionDetails from '@/utils/mqtt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import {
  CacheType,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class AliasCommand extends Command {
  constructor() {
    super('alias');
  }

  data = new SlashCommandBuilder()
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
            .setRequired(true)
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
        .addStringOption((option) =>
          option
            .setName('alias')
            .setRequired(true)
            .setDescription('The alias the game should be known by.')
        )
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const subcommand = interaction.options.getSubcommand(true);
    // console.log({ subcommand });
    if (subcommand === 'add') {
      const activity = interaction.options.getString('activity', true);
      const aliasName = interaction.options.getString('alias', true);

      try {
        await DynamicaAlias.create(interaction.guildId, activity, aliasName);
      } catch (error) {
        interaction.reply({ embeds: [ErrorEmbed(error.message)] });
        return;
      }

      await interaction.reply({
        embeds: [
          SuccessEmbed(
            `Alias ${inlineCode(aliasName)} added for ${inlineCode(activity)}.`
          ),
        ],
      });

      this.publish({
        subcommand,
        activity,
        aliasName,
        ...interactionDetails(interaction),
      });
    } else if (subcommand === 'update') {
      const activity = interaction.options.getString('activity', true);
      const aliasName = interaction.options.getString('alias', true);

      const existingAlias = Aliases.get(activity, interaction.guildId);

      if (!existingAlias) {
        interaction.reply({
          embeds: [ErrorEmbed('Alias not found.')],
        });
        return;
      }

      try {
        await existingAlias.update(aliasName, activity);
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          interaction.reply({
            embeds: [ErrorEmbed(error.message)],
          });
          return;
        }
      }

      await interaction.reply({
        embeds: [
          SuccessEmbed(
            `Successfully updated alias for \`${activity}\` to \`${aliasName}\``
          ),
        ],
      });

      this.publish({
        subcommand,
        activity,
        aliasName,
        ...interactionDetails(interaction),
      });
    } else if (subcommand === 'remove') {
      const activity = interaction.options.getString('activity', true);
      const foundAlias = Aliases.get(activity, interaction.guildId);
      await foundAlias.delete();
      await interaction.reply({
        embeds: [
          SuccessEmbed(`Successfully removed alias for \`${activity}\`.`),
        ],
      });

      this.publish({
        subcommand,
        activity,
        ...interactionDetails(interaction),
      });
    }
  };
}

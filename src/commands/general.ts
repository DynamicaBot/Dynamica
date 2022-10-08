import { Command } from '@/classes/Command';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaSecondary from '@classes/Secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

export class GeneralCommand extends Command {
  constructor() {
    super('general');
  }

  data = new SlashCommandBuilder()
    .setName('general')
    .setDefaultMemberPermissions('0')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the name/template for the default general channel.')
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName('channel')
        .setDescription('The channel to change the template for.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The new template for the general channel.')
        .setRequired(true)
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const name = interaction.options.getString('name', true);
    const channel = interaction.options.getString('channel', true);

    const updatedPrimary = await db.primary.update({
      where: { id: channel },
      data: { generalName: name },
      include: { secondaries: true },
    });

    updatedPrimary.secondaries.forEach(async (secondary) => {
      await DynamicaSecondary.get(secondary.id).update(interaction.client);
    });

    await interaction.reply(
      `General template for <#${channel}> changed to \`${name}\`.`
    );

    this.publish({
      name,
      ...interactionDetails(interaction),
    });
  };
}

import help from '@/help/general';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
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

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const name = interaction.options.getString('name', true);
  const channel = interaction.options.getString('channel', true);

  const updatedPrimary = await db.primary.update({
    where: { id: channel },
    data: { generalName: name },
    include: { secondaries: true },
  });

  updatedPrimary.secondaries.forEach(async (secondary) => {
    const dynamicaSecondary = await new DynamicaSecondary(
      interaction.client,
      secondary.id
    ).fetch();
    dynamicaSecondary?.update();
  });

  await interaction.reply(
    `General template for <#${channel}> changed to \`${name}\`.`
  );
};

export const general = new Command({
  preconditions: [checkManager],
  data,
  response,
  help,
});

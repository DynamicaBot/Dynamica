import help from '@/help/template';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('template')
  .setDefaultMemberPermissions('0')
  .setDescription('Edit the template for all secondary channels.')
  .addStringOption((option) =>
    option
      .setAutocomplete(true)
      .setName('channel')
      .setDescription('The channel to change the template for.')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('template')
      .setDescription('The new template for all secondary channels.')
      .setRequired(true)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const name = interaction.options.getString('template', true);
  const channel = interaction.options.getString('channel', true);

  const primary = await db.primary.update({
    where: { id: channel },
    data: { template: name },
    include: { secondaries: true },
  });

  primary.secondaries.forEach(async (secondary) => {
    const dynamicaSecondary = await new DynamicaSecondary(
      interaction.client,
      secondary.id
    ).fetch();

    dynamicaSecondary.update();
  });

  interaction.reply(`Template changed to \`${name}\`.`);
};

export const template = new Command({
  data,
  response,
  help,
  preconditions: [checkManager],
});

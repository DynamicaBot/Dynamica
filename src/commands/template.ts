import help from '@/help/template';
import Command from '@classes/command';
import DynamicaSecondary from '@classes/secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';

export default new Command()
  .setPreconditions([checkManager])
  .setCommandData(
    new SlashCommandBuilder()
      .setName('template')
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
      )
  )
  .setHelp(help)
  .setResponse(async (interaction) => {
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

    return interaction.reply(`Template changed to \`${name}\`.`);
  });

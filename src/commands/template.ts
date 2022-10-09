import Command from '@/classes/Command';
import MQTT from '@/classes/MQTT';
import Secondaries from '@/classes/Secondaries';
import { SuccessEmbed } from '@/utils/discordEmbeds';
import interactionDetails from '@/utils/mqtt';
import db from '@db';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class TemplateCommand extends Command {
  constructor() {
    super('template');
  }

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const template = interaction.options.getString('template', true);
    const channel = interaction.options.getString('primary', true);

    const primary = await db.primary.update({
      where: { id: channel },
      data: { template },
      include: { secondaries: true },
    });

    primary.secondaries.forEach(async (secondary) => {
      const dynamicaSecondary = Secondaries.get(secondary.id);

      dynamicaSecondary.update(interaction.client);
    });

    interaction.reply({
      embeds: [
        SuccessEmbed(
          `Template for ${channelMention(channel)} changed to ${inlineCode(
            template
          )}.`
        ),
      ],
    });
    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      name: template,
      ...interactionDetails(interaction),
    });
  };

  data = new SlashCommandBuilder()
    .setName('template')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the template for all secondary channels.')
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName('primary')
        .setDescription('The channel to change the template for.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('template')
        .setDescription('The new template for all secondary channels.')
        .setRequired(true)
    );
}

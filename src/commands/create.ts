import { MQTT } from '@/classes/MQTT';
import help from '@/help/create';
import { interactionDetails } from '@/utils/mqtt';
import Command from '@classes/Command';
import DynamicaPrimary from '@classes/Primary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildChannel,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('create')
  .setDescription('Create a primary channel.')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption((option) =>
    option
      .addChannelTypes(4)
      .setName('section')
      .setDescription(
        'A section that the voice channel should be created under.'
      )
      .setRequired(false)
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const section = interaction.options.getChannel(
    'section'
  ) as GuildChannel | null;
  const mqtt = MQTT.getInstance();
  if (!(interaction.member instanceof GuildMember)) return;
  const newPrimary = await DynamicaPrimary.initialise(
    interaction.guild,
    interaction.member,
    section
  );

  interaction.reply(
    `New voice channel <#${newPrimary.id}> successfully created.`
  );

  mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
    ...interactionDetails(interaction),
  });
};

export const create = new Command({
  preconditions: [checkManager],
  help,
  response,
  data,
});

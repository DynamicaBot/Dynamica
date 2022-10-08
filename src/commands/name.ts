import Command from '@/classes/Command';
import Secondaries from '@/classes/Secondaries';
import { secondaryCheck } from '@/preconditions/secondary';
import interactionDetails from '@/utils/mqtt';
import db from '@db';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

export default class NameCommand extends Command {
  constructor() {
    super('name');
  }

  conditions = [secondaryCheck];

  data = new SlashCommandBuilder()
    .setName('name')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the name of the current channel.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The new name of the channel (can be a template).')
        .setRequired(true)
    );

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const name = interaction.options.getString('name');
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    await db.secondary.update({ where: { id: channel.id }, data: { name } });
    this.logger.info(`${channel.id} name changed.`);

    await Secondaries.get(channel.id).update(interaction.client);

    interaction.reply(`Channel name changed to \`${name}\`.`);
    this.publish({
      channel: channel.id,
      name,
      ...interactionDetails(interaction),
    });
  };
}

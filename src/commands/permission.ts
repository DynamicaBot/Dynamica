import help from '@/help/permission';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import { ErrorEmbed } from '@utils/discordEmbeds';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Role,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('permission')
  .setDMPermission(false)
  .setDescription('Edit the permissions of a voice channel.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription(
        'Give permissions for the current voice channel for a role or user.'
      )
      .addRoleOption((option) =>
        option
          .setDescription('The role to add.')
          .setName('role')
          .setRequired(false)
      )
      .addUserOption((option) =>
        option
          .setDescription('The user to add.')
          .setName('user')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('remove')
      .setDescription(
        'Remove permissions for the current voice channel for a role or user.'
      )
      .addRoleOption((option) =>
        option
          .setDescription('The role to remove.')
          .setName('role')
          .setRequired(false)
      )
      .addUserOption((option) =>
        option
          .setDescription('The user to remove.')
          .setName('user')
          .setRequired(false)
      )
  );

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const subcommand = interaction.options.getSubcommand(true);
  const user = interaction.options.getUser('user', false);
  const role = interaction.options.getRole('role', false) as Role;

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const channel = guildMember?.voice.channel;
  const { permissionOverwrites } = channel;
  if (!user && !role) {
    interaction.reply({
      ephemeral: true,
      embeds: [ErrorEmbed('You must specify either a role or user.')],
    });
  }

  if (interaction.user === user) {
    interaction.reply({
      ephemeral: true,
      embeds: [ErrorEmbed("You add yourself silly. You're already added.")],
    });
  }

  if (subcommand === 'add') {
    permissionOverwrites.create(user || role, { Connect: true });
    interaction.reply({
      ephemeral: true,
      content: `You've added permission for ${
        user ? `<@${user.id}>` : `<@&${role.id}>`
      } to access <#${channel.id}>.`,
    });
  }
  if (subcommand === 'remove') {
    permissionOverwrites.create(user || role, { Connect: false });
    interaction.reply({
      ephemeral: true,
      content: `You've removed permission for ${
        user ? `<@${user.id}>` : `people with the role <@&${role.id}>`
      } to access the <#${channel.id}>.`,
    });
  }
};

export const permission = new Command({
  preconditions: [checkCreator, checkSecondary, checkAdminPermissions],
  data,
  help,
  response,
});

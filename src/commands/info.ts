import help from '@/help/info';
import Command from '@classes/command';
import DynamicaPrimary from '@classes/primary';
import DynamicaSecondary from '@classes/secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Get info about a primary or secondary channel.')
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('primary')
      .addStringOption((option) =>
        option
          .setAutocomplete(true)
          .setName('primarychannel')
          .setDescription('Primary channel to get info about.')
          .setRequired(true)
      )
      .setDescription('Get info about a primary channel.')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('secondary')
      .addStringOption((option) =>
        option
          .setAutocomplete(true)
          .setName('secondarychannel')
          .setDescription('Secondary channel to get info about.')
          .setRequired(true)
      )
      .setDescription('Get info about a secondary channel.')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('guild')
      .setDescription("Get info about the guild's settings.")
  );

const response = async (interaction) => {
  const subcommand = interaction.options.getSubcommand(true);
  if (subcommand === 'primary') {
    const chosenPrimary = interaction.options.getString('primarychannel', true);
    const primary = await new DynamicaPrimary(
      interaction.client,
      chosenPrimary
    ).fetch();
    interaction.reply({
      ephemeral: true,
      content: `Here's the current info for <#${primary.id}>`,
      embeds: [
        new EmbedBuilder().addFields(
          {
            name: 'General Template',
            value: primary.prisma.generalName,
          },
          {
            name: 'Activity Template',
            value: primary.prisma.template,
          },
          {
            name: '# of Secondary channels',
            value: primary.prisma.secondaries.length.toString(),
          }
        ),
      ],
    });
  } else if (subcommand === 'secondary') {
    const chosenSecondary = interaction.options.getString(
      'secondarychannel',
      true
    );
    const secondary = await new DynamicaSecondary(
      interaction.client,
      chosenSecondary
    ).fetch();
    interaction.reply({
      ephemeral: true,
      content: `Here's the current info for <#${secondary.id}>`,
      embeds: [
        new EmbedBuilder().addFields(
          {
            name: 'Name Override',
            value: secondary.prisma.name ?? '`Not set`',
          },
          {
            name: 'Locked',
            value: secondary.prisma.locked ? '🔒 - Locked' : '🔓 - Unlocked',
          },
          {
            name: 'Owner',
            value: (
              await interaction.guild.members.cache.get(
                secondary.prisma.creator
              )
            ).user.tag,
          }
        ),
      ],
    });
  } else if (subcommand === 'guild') {
    const prismaGuild = await db.guild.findUnique({
      where: { id: interaction.guildId },
    });
    interaction.reply({
      ephemeral: true,
      content: "Here's the current info for the guild",
      embeds: [
        new EmbedBuilder().addFields({
          name: 'Join Requests',
          value: prismaGuild.allowJoinRequests ? 'Enabled' : 'Disabled',
        }),
      ],
    });
  }
};

export const info = new Command({ data, help, response });

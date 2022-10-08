import { Command } from '@/classes/Command';
import { ErrorEmbed } from '@/utils/discordEmbeds';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaPrimary from '@classes/Primary';
import DynamicaSecondary from '@classes/Secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

export class InfoCommand extends Command {
  constructor() {
    super('info');
  }

  data = new SlashCommandBuilder()
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

  response = async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);
    if (subcommand === 'primary') {
      const chosenPrimary = interaction.options.getString(
        'primarychannel',
        true
      );
      const primary = DynamicaPrimary.get(chosenPrimary);
      if (!primary) {
        interaction.reply({
          embeds: [ErrorEmbed('That primary channel does not exist.')],
          ephemeral: true,
        });
        return;
      }
      const prisma = await primary.prisma();

      interaction.reply({
        ephemeral: true,
        content: `Here's the current info for <#${primary.id}>`,
        embeds: [
          new EmbedBuilder().addFields(
            {
              name: 'General Template',
              value: prisma.generalName,
            },
            {
              name: 'Activity Template',
              value: prisma.template,
            },
            {
              name: '# of Secondary channels',
              value: prisma.secondaries.length.toString(),
            }
          ),
        ],
      });
      this.publish({
        channel: primary.id,
        subcommand,
        ...interactionDetails(interaction),
      });
    } else if (subcommand === 'secondary') {
      const chosenSecondary = interaction.options.getString(
        'secondarychannel',
        true
      );
      const secondary = DynamicaSecondary.get(chosenSecondary);
      if (!secondary) {
        interaction.reply({
          ephemeral: true,
          embeds: [ErrorEmbed('That secondary channel does not exist.')],
        });
        return;
      }
      const prisma = await secondary.prisma();
      interaction.reply({
        ephemeral: true,
        content: `Here's the current info for <#${secondary.id}>`,
        embeds: [
          new EmbedBuilder().addFields(
            {
              name: 'Name Override',
              value: prisma.name ?? '`Not set`',
            },
            {
              name: 'Locked',
              value: prisma.locked ? '🔒 - Locked' : '🔓 - Unlocked',
            },
            {
              name: 'Owner',
              value: (await interaction.guild.members.cache.get(prisma.creator))
                .user.tag,
            }
          ),
        ],
      });
      this.publish({
        channel: secondary.id,
        subcommand,
        ...interactionDetails(interaction),
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
      this.publish({
        subcommand,
        ...interactionDetails(interaction),
      });
    }
  };
}

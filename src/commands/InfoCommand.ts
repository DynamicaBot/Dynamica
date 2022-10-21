import Command, { CommandToken } from '@/classes/Command';
import Condition from '@/classes/Condition';
import Primaries from '@/classes/Primaries';
import Secondaries from '@/classes/Secondaries';
import { ErrorEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import DB from '@/services/DB';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class InfoCommand extends Command {
  constructor(
    private logger: Logger,
    private secondaries: Secondaries,
    private primaries: Primaries,
    private db: DB
  ) {
    super('info');
  }

  conditions: Condition[];

  name: string = 'info';

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
            .setName('primary')
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
            .setName('secondary')
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

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);
    if (subcommand === 'primary') {
      const chosenPrimary = interaction.options.getString('primary', true);
      const primary = await this.primaries.get(chosenPrimary);
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
    } else if (subcommand === 'secondary') {
      const chosenSecondary = interaction.options.getString('secondary', true);
      const secondary = await this.secondaries.get(chosenSecondary);
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
    } else if (subcommand === 'guild') {
      const prismaGuild = await this.db.guild.findUnique({
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
}

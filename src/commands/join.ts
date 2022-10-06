import help from '@/help/join';
import Command from '@classes/command';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ErrorEmbed } from '@utils/discordEmbeds';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const channel = interaction.options.getString('channel', true);

  if (!interaction.guild) return;

  const channelConfig = await db.secondary.findUnique({
    where: { id: channel },
    include: { guild: true },
  });
  if (!channelConfig.guild.allowJoinRequests) {
    interaction.reply({
      content: 'Error',
      embeds: [ErrorEmbed('Join Requests are not enabled on this server.')],
    });
  }

  const { creator } = channelConfig;

  const row = new ActionRowBuilder<ButtonBuilder>({
    type: ComponentType.ActionRow,
  }).addComponents(
    new ButtonBuilder()
      .setCustomId('channeljoinaccept')
      .setLabel('Allow')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('channeljoindeny')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
  );
  interaction.reply({
    components: [row],
    content: `Does <@${interaction.user.id}> have permission to join <#${channel}>? As the creator <@${creator}>, are they allowed to join?`,
  });
  interaction.channel
    .createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (filteritem) => filteritem.user.id === channelConfig.creator,
    })
    .once('collect', async (collected) => {
      const button = collected;
      if (button.customId === 'channeljoinaccept') {
        const discordChannel = await collected.guild.channels.cache.get(
          channel
        );
        if (!discordChannel.isVoiceBased()) return;

        await discordChannel.permissionOverwrites.create(interaction.user, {
          Connect: true,
        });
        await interaction.editReply(
          `<@${interaction.user.id}> has been granted access to <#${channel}>.`
        );
        await collected.reply({
          ephemeral: true,
          content: `You have granted access for <@${interaction.user.id}> to access <#${channel}>.`,
        });
      } else if (button.customId === 'channeljoindeny') {
        await interaction.editReply({
          content: null,
          components: [],
          embeds: [ErrorEmbed(`You have been denied access to <#${channel}>.`)],
        });
        await collected.reply({
          content: `You have denied access to <#${channel}>.`,
          ephemeral: true,
        });
      } else {
        interaction.reply('Wrong button');
      }
    });
};

const data = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Request to join a locked voice channel.')
  .addStringOption((option) =>
    option
      .setAutocomplete(true)
      .setName('channel')
      .setDescription('The channel to request to join.')
      .setRequired(true)
  );

export const join = new Command({ help, data, response });

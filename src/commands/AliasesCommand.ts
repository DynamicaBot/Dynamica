import Aliases from '@/classes/Aliases';
import Command from '@/classes/Command';
import { InfoEmbed } from '@/utils/discordEmbeds';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';

export default class AliasesCommand extends Command {
  constructor() {
    super('aliases');
  }

  // eslint-disable-next-line class-methods-use-this
  data = new SlashCommandBuilder()
    .setName('aliases')
    .setDescription('List aliases for games.')
    .setDMPermission(false);

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const aliases = Aliases.getByGuildId(interaction.guildId);
    const inlineAliases = await Promise.all(
      aliases.map(async ({ activity }) => {
        const alias = Aliases.get(activity, interaction.guildId);
        const aliasPrisma = await alias.prisma();
        return {
          name: activity,
          value: aliasPrisma.alias,
          inline: true,
        };
      })
    );

    const embeds = _.chunk(inlineAliases, 25).map((result, index) =>
      InfoEmbed("Information about aliases for this server's games.")
        .addFields(...result)
        .setTitle(`Aliases (${index + 1})`)
    );
    interaction.reply({
      embeds,
      ephemeral: true,
    });
  };
}

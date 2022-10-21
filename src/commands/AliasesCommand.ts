import Aliases from '@/classes/Aliases';
import Command, { CommandToken } from '@/classes/Command';
import { InfoEmbed } from '@/utils/discordEmbeds';
import Logger from '@/services/Logger';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';
import { Service } from 'typedi';

@Service({ id: CommandToken, multiple: true })
export default class AliasesCommand extends Command {
  constructor(private logger: Logger, private aliases: Aliases) {
    super('aliases');
  }

  conditions = [];

  // eslint-disable-next-line class-methods-use-this
  data = new SlashCommandBuilder()
    .setName('aliases')
    .setDescription('List aliases for games.')
    .setDMPermission(false);

  // eslint-disable-next-line class-methods-use-this
  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const aliases = await this.aliases.getByGuild(interaction.guildId);
    const inlineAliases = await Promise.all(
      aliases.map(async ({ activity }) => {
        const alias = this.aliases.get(activity, interaction.guildId);
        const aliasPrisma = await alias;
        return {
          name: activity,
          value: aliasPrisma.alias,
          inline: true,
        };
      })
    );

    const embeds = _.chunk(inlineAliases, 25).map((result, index) =>
      InfoEmbed("Information about aliases for this server's games.")
        .addFields(result)
        .setTitle(`Aliases (${index + 1})`)
    );
    interaction.reply({
      embeds: embeds.length ? embeds : [InfoEmbed('No aliases found')],
      ephemeral: true,
    });
  };
}

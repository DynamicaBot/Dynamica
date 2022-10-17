import Aliases from '@/classes/Aliases';
import channelActivities from '@/utils/activity';
import Autocomplete, { AutocompleteToken } from '@/classes/Autocomplete';
import { AutocompleteInteraction, CacheType, GuildMember } from 'discord.js';
import Fuse from 'fuse.js';
import { Service } from 'typedi';

@Service({ id: AutocompleteToken, multiple: true })
export default class AliasAutocomplete implements Autocomplete {
  name = 'alias';

  constructor(private aliases: Aliases) {}

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void> = async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const member = interaction.member as GuildMember;
    const subcommand = interaction.options.getSubcommand(true) as
      | 'update'
      | 'remove'
      | 'add';

    let options: { name: string; value: string }[] = [];

    if (subcommand === 'update' || subcommand === 'remove') {
      const existingAliases = await this.aliases.getByGuild(
        interaction.guildId
      );
      options = existingAliases.map(({ activity }) => ({
        name: activity,
        value: activity,
      }));
    } else if (subcommand === 'add') {
      const activities = member.voice.channel
        ? channelActivities(member.voice.channel)
        : [];

      options = activities.map((activity) => ({
        name: activity,
        value: activity,
      }));
    }

    // const options = [...channelActivityList, ...existingAliases];

    const fuse = new Fuse(options, {
      keys: ['name'],
    });
    const query = fuse.search(value.toString());
    // console.log({ results: query.map((result) => result.item).slice(0, 24) });
    interaction.respond(
      value.toString()
        ? query.map((result) => result.item).slice(0, 24)
        : options.slice(0, 24)
    );
  };
}

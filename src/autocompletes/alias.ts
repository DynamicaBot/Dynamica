import { channelActivities } from '@/utils/activity';
import db from '@/utils/db';
import Autocomplete from '@classes/Autocomplete';
import { GuildMember } from 'discord.js';
import Fuse from 'fuse.js';

export default new Autocomplete()
  .setName('alias')
  .setResponse(async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const member = interaction.member as GuildMember;
    const subcommand = interaction.options.getSubcommand(true) as
      | 'update'
      | 'remove'
      | 'list'
      | 'add';
    console.log({ subcommand });

    let options: { name: string; value: string }[] = [];

    if (subcommand === 'update' || subcommand === 'remove') {
      const existingAliases = await db.alias.findMany({
        where: { guildId: interaction.guildId },
      });
      options = existingAliases.map(({ activity, id }) => ({
        name: activity,
        value: activity,
      }));
    } else if (subcommand === 'add') {
      const activities = channelActivities(member.voice.channel);
      console.log({
        activities: (
          await Promise.all(
            member.voice.channel.members.map(
              async (m) => (await m.fetch()).presence.activities
            )
          )
        ).flat(),
      });
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
    console.log({ results: query.map((result) => result.item).slice(0, 24) });
    interaction.respond(
      value.toString()
        ? query.map((result) => result.item).slice(0, 24)
        : options.slice(0, 24)
    );
  });

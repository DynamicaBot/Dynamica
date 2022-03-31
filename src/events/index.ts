import Event from '@/classes/event';
import autocomplete from './autocomplete';
import channelDelete from './channelDelete';
import command from './command';
import guildCreate from './guildCreate';
import guildDelete from './guildDelete';
import presenceUpdate from './presenceUpdate';
import ready from './ready';
import voiceStateUpdate from './voiceStateUpdate';

interface EventsInterface {
  [key: string]: Event;
}

const exports: EventsInterface = {
  autocomplete,
  channelDelete,
  command,
  guildCreate,
  guildDelete,
  presenceUpdate,
  ready,
  voiceStateUpdate,
};

export default exports;

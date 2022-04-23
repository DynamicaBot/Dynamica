import Event from '@/classes/event';
import { ClientEvents } from 'discord.js';
import autocomplete from './autocomplete';
import command from './command';
import guildCreate from './guildCreate';
import guildDelete from './guildDelete';
import presenceUpdate from './presenceUpdate';
import ready from './ready';
import voiceStateUpdate from './voiceStateUpdate';

interface EventsInterface {
  [key: string]: Event<keyof ClientEvents>;
}

const exports: EventsInterface = {
  autocomplete,
  command,
  guildCreate,
  guildDelete,
  presenceUpdate,
  ready,
  voiceStateUpdate,
};

export default exports;

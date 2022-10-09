import Events from '@/classes/Events';
import AutocompleteEvent from './events/AutocompleteEvent';
import ChannelDeleteEvent from './events/ChannelDeleteEvent';
import CommandEvent from './events/CommandEvent';
import GuildCreateEvent from './events/GuildCreateEvent';
import GuildDeleteEvent from './events/GuildDeleteEvent';
import PresenceUpdateEvent from './events/PresenceUpdateEvent';
import ReadyEvent from './events/ReadyEvent';
import VoiceStateUpdateEvent from './events/VoiceStateUpdateEvent';

const registerEvents = () => {
  Events.register(new AutocompleteEvent());
  Events.register(new CommandEvent());
  Events.register(new GuildCreateEvent());
  Events.register(new GuildDeleteEvent());
  Events.register(new PresenceUpdateEvent());
  Events.register(new ReadyEvent());
  Events.register(new VoiceStateUpdateEvent());
  Events.register(new ChannelDeleteEvent());
};

export default registerEvents;

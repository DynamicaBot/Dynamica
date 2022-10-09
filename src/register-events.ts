import Events from '@/classes/Events';
import AutocompleteEvent from './events/autocomplete';
import ChannelDeleteEvent from './events/channelDelete';
import CommandEvent from './events/command';
import GuildCreateEvent from './events/guildCreate';
import GuildDeleteEvent from './events/guildDelete';
import PresenceUpdateEvent from './events/presenceUpdate';
import ReadyEvent from './events/ready';
import VoiceStateUpdateEvent from './events/voiceStateUpdate';

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

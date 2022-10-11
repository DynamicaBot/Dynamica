import Events from '@/classes/Events';
import { Container } from 'typedi';
import { EventToken } from './classes/Event';
import AutocompleteEvent from './events/AutocompleteEvent';
import ChannelDeleteEvent from './events/ChannelDeleteEvent';
import CommandEvent from './events/CommandEvent';
import GuildCreateEvent from './events/GuildCreateEvent';
import GuildDeleteEvent from './events/GuildDeleteEvent';
import PresenceUpdateEvent from './events/PresenceUpdateEvent';
import ReadyEvent from './events/ReadyEvent';
import VoiceStateUpdateEvent from './events/VoiceStateUpdateEvent';

const registerEvents = () => {
  Container.import([
    AutocompleteEvent,
    ChannelDeleteEvent,
    CommandEvent,
    GuildCreateEvent,
    GuildDeleteEvent,
    PresenceUpdateEvent,
    ReadyEvent,
    VoiceStateUpdateEvent,
  ]);
  Container.getMany(EventToken).forEach((event) => {
    Container.get(Events).register(event);
  });
};

export default registerEvents;

import { Events } from './classes/Event';
import { AutocompleteEvent } from './events/autocomplete';
import { CommandEvent } from './events/command';
import { GuildCreateEvent } from './events/guildCreate';
import { GuildDeleteEvent } from './events/guildDelete';
import { PresenceUpdateEvent } from './events/presenceUpdate';
import { ReadyEvent } from './events/ready';
import { VoiceStateUpdateEvent } from './events/voiceStateUpdate';

export class RegisterEvents {
  constructor() {
    Events.register(new AutocompleteEvent());
    Events.register(new CommandEvent());
    Events.register(new GuildCreateEvent());
    Events.register(new GuildDeleteEvent());
    Events.register(new PresenceUpdateEvent());
    Events.register(new ReadyEvent());
    Events.register(new VoiceStateUpdateEvent());
  }
}

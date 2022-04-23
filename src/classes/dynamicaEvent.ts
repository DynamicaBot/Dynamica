// create a custom event emitter with typesafe emitters
import { CommandInteraction, GuildMember } from 'discord.js';
import { EventEmitter } from 'events';
import DynamicaPrimary from './primary';
import DynamicaSecondary from './secondary';
const emitter = new EventEmitter();

type Awaitable<T> = T | PromiseLike<T>;

interface DynamicaEventTypes {
    secondaryJoined: [secondary: DynamicaSecondary, guildMember: GuildMember]
    primaryJoined: [primary: DynamicaPrimary, guildMember: GuildMember]
    secondaryLeft: [secondary: DynamicaSecondary, guildMember: GuildMember]
    primaryLeft: [primary: DynamicaPrimary, guildMember: GuildMember]
}

export class DynamicaEventManager extends EventEmitter {
    constructor() {
        super();
    }
    emit<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.emit(event, listener);
    }
    on<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.on(event, listener);
    }
    once<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.once(event, listener);
    }
    prependListener<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.prependListener(event, listener);
    }
    prependOnceListener<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.prependOnceListener(event, listener);
    }
    removeListener<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.removeListener(event, listener);
    }
    removeAllListeners(event?: keyof DynamicaEventTypes) {
        return super.removeAllListeners(event);
    }
    off<K extends keyof DynamicaEventTypes>(event: K, listener: (...args: DynamicaEventTypes[K]) => Awaitable<void>) {
        return super.off(event, listener);
    }
    listeners(event: keyof DynamicaEventTypes) {
        return super.listeners(event);
    }
    rawListeners(event: keyof DynamicaEventTypes) {
        return super.rawListeners(event);
    }
    listenerCount(event: keyof DynamicaEventTypes): number {
        return super.listenerCount(event);
    }
    eventNames(): Array<keyof DynamicaEventTypes> {
        return super.eventNames().map((event) => event as keyof DynamicaEventTypes);
    }
}


emitter.emit('event', 'hello', 'world');
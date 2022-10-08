import { Commands } from '@/classes/Command';
import { Event } from '@classes/Event';
import { CacheType, Interaction } from 'discord.js';

export class CommandEvent extends Event<'interactionCreate'> {
  constructor() {
    super('interactionCreate');
  }

  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    Commands.run(interaction);
  };
}

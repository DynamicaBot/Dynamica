import Commands from '@/classes/Commands';
import Event from '@classes/Event';
import { CacheType, Interaction } from 'discord.js';

export default class CommandEvent extends Event<'interactionCreate'> {
  constructor() {
    super('interactionCreate');
  }

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    Commands.run(interaction);
  };
}

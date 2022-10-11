import Commands from '@/classes/Commands';
import Event, { EventToken } from '@classes/Event';
import { CacheType, Interaction } from 'discord.js';
import { Service } from 'typedi';

@Service({ id: EventToken, multiple: true })
export default class CommandEvent implements Event<'interactionCreate'> {
  constructor(private commands: Commands) {}

  event: 'interactionCreate' = 'interactionCreate';

  once: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  public response: (
    interaction: Interaction<CacheType>
  ) => void | Promise<void> = (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    this.commands.run(interaction);
  };
}

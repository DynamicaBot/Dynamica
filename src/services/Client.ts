import { Client as DiscordClient, IntentsBitField } from 'discord.js';
import { Service } from 'typedi';
import Logger from '@/services/Logger';

const intents = new IntentsBitField().add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildVoiceStates,
  IntentsBitField.Flags.GuildPresences
);

@Service()
export default class Client extends DiscordClient {
  constructor(private logger: Logger) {
    super({
      intents,
    });
  }
}

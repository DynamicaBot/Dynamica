import { Primary, Secondary } from '@prisma/client';
import { Client, VoiceBasedChannel } from 'discord.js';

export enum DynamicaChannelType {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export interface DynamicaChannel<K extends DynamicaChannelType> {
  type: K;
  id: string;
  guildId: string;

  discord: (client: Client<true>) => Promise<VoiceBasedChannel>;
  prisma: () => Promise<PrismaReturnTypes[K]>;

  deleteDiscord: (client: Client<true>) => Promise<void>;
  deletePrisma: () => Promise<void>;
  delete: (client: Client<true>) => Promise<void>;
}

type PrismaReturnTypes = {
  [DynamicaChannelType.Primary]: Primary;
  [DynamicaChannelType.Secondary]: Secondary;
};

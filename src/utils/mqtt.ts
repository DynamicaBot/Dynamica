import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export const interactionDetails = (
  interaction: ChatInputCommandInteraction<CacheType>
) => ({
  name: interaction.commandName,
  timestamp: new Date(interaction.createdTimestamp).toISOString(),
});

import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const interactionDetails = (
  interaction: ChatInputCommandInteraction<CacheType>
) => ({
  name: interaction.commandName,
  timestamp: new Date(interaction.createdTimestamp).toISOString(),
});

export default interactionDetails;

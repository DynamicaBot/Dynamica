import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export const interactionDetails = (
  interaction: ChatInputCommandInteraction<CacheType>
) => ({
  name: interaction.commandName,
  timestamp: interaction.createdTimestamp,
  guild: {
    id: interaction.guildId,
    name: interaction.guild.name,
  },
  user: {
    id: interaction.user.id,
    name: interaction.user.tag,
  },
});

import { EmbedBuilder } from 'discord.js';

export const ErrorEmbed = (message: string) =>
  new EmbedBuilder()
    .setColor(15158332)
    .setDescription(message)
    .setAuthor({
      name: 'Dynamica',
      url: 'https://dynamica.dev',
      iconURL: 'https://dynamica.dev/img/dynamica.png',
    })
    .setTitle('Error');

export const SuccessEmbed = (message: string) =>
  new EmbedBuilder().setColor(3066993).setDescription(message).setAuthor({
    name: 'Dynamica',
    url: 'https://dynamica.dev',
    iconURL: 'https://dynamica.dev/img/dynamica.png',
  });

export const InfoEmbed = (message: string) =>
  new EmbedBuilder().setColor(3447003).setDescription(message).setAuthor({
    name: 'Dynamica',
    url: 'https://dynamica.dev',
    iconURL: 'https://dynamica.dev/img/dynamica.png',
  });

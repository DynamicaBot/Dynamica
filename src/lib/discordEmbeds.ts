import { Embed } from "@discordjs/builders";

export const ErrorEmbed = (message: string) =>
  new Embed().setColor(15158332).setDescription(message).setAuthor({
    name: "Dynamica",
    url: "https://dynamica.dev",
    iconURL: "https://dynamica.dev/img/dynamica.png",
  });

export const SuccessEmbed = (message: string) =>
  new Embed().setColor(3066993).setDescription(message).setAuthor({
    name: "Dynamica",
    url: "https://dynamica.dev",
    iconURL: "https://dynamica.dev/img/dynamica.png",
  });

export const InfoEmbed = (message: string) =>
  new Embed().setColor(3447003).setDescription(message).setAuthor({
    name: "Dynamica",
    url: "https://dynamica.dev",
    iconURL: "https://dynamica.dev/img/dynamica.png",
  });

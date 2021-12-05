import { Embed } from "@discordjs/builders";

export const ErrorEmbed = (message: string) =>
  new Embed().setColor(15158332).setDescription(message).setTitle("Error");

export const SuccessEmbed = (message: string) =>
  new Embed().setColor(3066993).setDescription(message).setTitle("Success");

export const InfoEmbed = (message: string) =>
  new Embed().setColor(3447003).setDescription(message).setTitle("Info");

import { Embed } from "@discordjs/builders";
import { Guild } from "discord.js";
import checkGuild from "../lib/checks/guild";
import { logger } from "../lib/logger";
import { event } from "./event";

/**
 * The list of basic commands to display.
 */
const basicCommands: {
  /**
   * The name of the command.
   */
  command: string;
  /**
   * The link to the help page of the command.
   */
  help: string;
  /**
   * The description of the command.
   */
  description: string;
}[] = [
  {
    command: "/help",
    help: "https://dynamica.dev/docs/commands/help",
    description: "Get a list of commands and their descriptions",
  },
  {
    command: "/invite",
    help: "https://dynamica.dev/docs/commands/invite",
    description: "Get an invite link for the bot",
  },
  {
    command: "/create",
    help: "https://dynamica.dev/docs/commands/create",
    description: "Create a new channel for people to join",
  },
  {
    command: "/alias",
    help: "https://dynamica.dev/docs/commands/alias",
    description: "Create a new alias for an activity",
  },
];

const botInfoEmbed = new Embed()
  .setTitle("Welcome to Dynamica!")
  .setDescription(
    "Dynamica is a Discord bot that allows you to manage voice channels in your server with ease.\n"
  )
  .addField({
    name: "Basic Commands",
    value: basicCommands
      .map((command) => `\`${command.command}\` - ${command.description}`)
      .join("\n"),
    inline: false,
  })
  .addField({
    name: "Website",
    value: `Maybe you know this already but you can find out more about Dynamica at [dynamica.dev](https://dynamica.dev) including more commands.`,
  })
  .addField({
    name: "Support",
    value: `If you have any questions or issues, you can join the [support server](https://discord.gg/zs892m6btf).`,
  })
  .setAuthor({
    name: "Dynamica",
    iconURL: "https://dynamica.dev/dynamica.png",
  });

export const guildCreate: event = {
  name: "guildCreate",
  once: false,
  async execute(guild: Guild) {
    guild.systemChannel.send({
      content: "test",
      embeds: [botInfoEmbed],
    });
    checkGuild(guild.id);
    logger.debug(`Joined guild ${guild.id} named: ${guild.name}`);
  },
};

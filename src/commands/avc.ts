import { hyperlink, SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const avc: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("avc")
    .setDescription("About the original Auto Voice Channels bot by pixaal."),
  helpText: {
    short: `Replies with a reference to the ideas for the bot which can be found ${hyperlink(
      "here",
      "https://dynamica.dev/docs/avc"
    )}.`,
  },
  async execute(interaction) {
    return interaction.reply(
      `This bot was heavily inspired by the ${hyperlink(
        "Auto Voice Channels",
        "https://wiki.dotsbots.com/"
      )} by Pixaal who put in a lot of effort to make the bot easy to use as well as support the thousands of server utilising the free tier than he graciously provided. A bot than renames channels is hard to make and even harder to manage.\nSadly, only a few months after I discovered AVC and begun selfhosting it discord made a controversial decision to get rid of the ability for bots to read messages, instead forcing frameworks and bot owners to use the new slash commands. This caused developers, frustrated with Discord's direction to drop support for Discord.py (which AVC was built on) leading to the EOL of the AVC bot.\n- Thanks Pixaal`
    );
  },
};

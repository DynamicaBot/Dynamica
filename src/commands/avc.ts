import { hyperlink, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandBuilder } from "../lib/builders";

export const avc = new CommandBuilder()
  .setConditions([])
  .setData(
    new SlashCommandBuilder()
      .setName("avc")
      .setDescription("About the original Auto Voice Channels bot by pixaal.")
  )
  .setResponse(async (interaction: CommandInteraction) => {
    interaction.reply(
      `This bot was heavily inspired by the ${hyperlink(
        "Auto Voice Channels",
        "https://wiki.dotsbots.com/"
      )} by Pixaal who put in a lot of effort to make the bot easy to use as well as support the thousands of server utilising the free tier than he graciously provided. A bot than renames channels is hard to make and even harder to manage.\nSadly, only a few months after I discovered AVC and begun selfhosting it discord made a controversial decision to get rid of the ability for bots to read messages, instead forcing frameworks and bot owners to use the new slash commands. This caused developers, frustrated with Discord's direction to drop support for Discord.py (which AVC was built on) leading to the EOL of the AVC bot.\n- Thanks Pixaal`
    );
  });

import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const about: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription(`About the bot.`),
  helpText: { short: `A command that links to the bot's website.` },
  async execute(interaction) {
    interaction.reply({
      embeds: [
        new Embed()
          .setTitle("About")
          .setAuthor({ name: "Sebastian P", url: "https://sebasptsch.dev" })
          .setImage(
            "https://github.com/DynamicaBot/Dynamica/raw/master/assets/DynamicaBanner.png"
          )
          .setDescription("About the Dynamica Bot")
          .setURL("https://github.com/DynamicaBot/Dynamica"),
      ],
    });
  },
};
